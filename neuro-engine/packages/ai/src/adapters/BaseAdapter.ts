import type { MessageParam } from 'openai/resources/index.mjs';

export interface CompletionRequest {
  system?: string;
  user?: string;
  messages?: MessageParam[];
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>;
}

export interface CompletionResponse {
  id: string;
  created: number;
  content: string;
  raw: unknown;
}

export interface AIAdapter {
  readonly name: string;
  complete(request: CompletionRequest): Promise<CompletionResponse>;
}

export type AdapterFactory<T extends AIAdapter = AIAdapter> = (options?: unknown) => T;
