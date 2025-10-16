import { EventEmitter } from 'eventemitter3';

export type MemoryMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface MemoryMessage {
  role: MemoryMessageRole;
  content: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface MemoryAdapter extends EventEmitter<{ change: [MemoryMessage[]] }> {
  readonly kind: string;
  append(message: MemoryMessage): Promise<void>;
  history(limit?: number): Promise<MemoryMessage[]>;
  reset(): Promise<void>;
}

export class InMemoryAdapter extends EventEmitter<{ change: [MemoryMessage[]] }> implements MemoryAdapter {
  public readonly kind = 'memory';
  private readonly store: MemoryMessage[] = [];

  async append(message: MemoryMessage): Promise<void> {
    this.store.push(message);
    this.emit('change', [...this.store]);
  }

  async history(limit?: number): Promise<MemoryMessage[]> {
    if (typeof limit === 'number') {
      return this.store.slice(-limit);
    }
    return [...this.store];
  }

  async reset(): Promise<void> {
    this.store.length = 0;
    this.emit('change', []);
  }
}

export interface SqliteAdapterOptions {
  filename?: string;
}

export class SqliteMemoryAdapter extends EventEmitter<{ change: [MemoryMessage[]] }> implements MemoryAdapter {
  public readonly kind = 'sqlite';
  private db: any;
  private readonly options: SqliteAdapterOptions;

  constructor(options: SqliteAdapterOptions = {}) {
    super();
    this.options = options;
  }

  private async ensureDb() {
    if (this.db) return this.db;
    try {
      const Database = (await import('better-sqlite3')).default;
      this.db = new Database(this.options.filename ?? ':memory:');
      this.db.exec(
        'CREATE TABLE IF NOT EXISTS memories (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT, content TEXT, created_at TEXT, metadata TEXT)'
      );
      return this.db;
    } catch (error) {
      console.warn('better-sqlite3 unavailable, falling back to in-memory adapter', error);
      const fallback = new InMemoryAdapter();
      this.append = fallback.append.bind(fallback);
      this.history = fallback.history.bind(fallback);
      this.reset = fallback.reset.bind(fallback);
      return null;
    }
  }

  async append(message: MemoryMessage): Promise<void> {
    const db = await this.ensureDb();
    if (!db) {
      return;
    }

    db.prepare(
      'INSERT INTO memories (role, content, created_at, metadata) VALUES (@role, @content, @createdAt, @metadata)'
    ).run({
      role: message.role,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      metadata: message.metadata ? JSON.stringify(message.metadata) : null
    });

    this.emit('change', await this.history());
  }

  async history(limit?: number): Promise<MemoryMessage[]> {
    const db = await this.ensureDb();
    if (!db) {
      return [];
    }

    const rows = db
      .prepare('SELECT role, content, created_at as createdAt, metadata FROM memories ORDER BY id ASC')
      .all();

    const messages = rows.map((row: any) => ({
      role: row.role as MemoryMessageRole,
      content: row.content as string,
      createdAt: new Date(row.createdAt),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined
    }));

    if (typeof limit === 'number') {
      return messages.slice(-limit);
    }

    return messages;
  }

  async reset(): Promise<void> {
    const db = await this.ensureDb();
    if (!db) {
      return;
    }

    db.prepare('DELETE FROM memories').run();
    this.emit('change', []);
  }
}

export interface RedisAdapterOptions {
  url: string;
  key?: string;
}

export class RedisMemoryAdapter extends EventEmitter<{ change: [MemoryMessage[]] }> implements MemoryAdapter {
  public readonly kind = 'redis';
  private readonly key: string;
  private clientPromise: Promise<any> | null = null;
  private readonly options: RedisAdapterOptions;

  constructor(options: RedisAdapterOptions) {
    super();
    this.options = options;
    this.key = options.key ?? 'neuro-engine:memory';
  }

  private async getClient() {
    if (!this.clientPromise) {
      this.clientPromise = import('ioredis').then(({ default: Redis }) => new Redis(this.options.url));
    }
    return this.clientPromise;
  }

  async append(message: MemoryMessage): Promise<void> {
    const client = await this.getClient();
    await client.rpush(this.key, JSON.stringify(message));
    this.emit('change', await this.history());
  }

  async history(limit?: number): Promise<MemoryMessage[]> {
    const client = await this.getClient();
    const raw = await client.lrange(this.key, 0, -1);
    const messages = raw.map((item: string) => {
      const parsed = JSON.parse(item) as MemoryMessage;
      parsed.createdAt = new Date(parsed.createdAt);
      return parsed;
    });

    if (typeof limit === 'number') {
      return messages.slice(-limit);
    }

    return messages;
  }

  async reset(): Promise<void> {
    const client = await this.getClient();
    await client.del(this.key);
    this.emit('change', []);
  }
}
