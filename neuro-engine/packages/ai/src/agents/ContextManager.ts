import { EventEmitter } from 'eventemitter3';
import type { MessageParam } from 'openai/resources/index.mjs';

import type { MemoryAdapter, MemoryMessage } from './MemoryBuffer.js';
import { InMemoryAdapter } from './MemoryBuffer.js';

export interface ContextEventMap {
  append: [MemoryMessage];
  reset: [];
}

export interface ContextManagerOptions {
  adapter?: MemoryAdapter;
  retention?: number;
}

export class ContextManager extends EventEmitter<ContextEventMap> {
  private readonly adapter: MemoryAdapter;
  private readonly retention?: number;

  constructor(options: ContextManagerOptions = {}) {
    super();
    this.adapter = options.adapter ?? new InMemoryAdapter();
    this.retention = options.retention;
  }

  get history(): Promise<MessageParam[]> {
    return this.adapter.history(this.retention).then((messages) =>
      messages.map((message) => ({ role: message.role, content: message.content }))
    );
  }

  async append(message: Omit<MemoryMessage, 'createdAt'> & { createdAt?: Date }): Promise<void> {
    const record: MemoryMessage = {
      ...message,
      createdAt: message.createdAt ?? new Date()
    };
    await this.adapter.append(record);
    this.emit('append', record);
  }

  async reset(): Promise<void> {
    await this.adapter.reset();
    this.emit('reset');
  }
}
