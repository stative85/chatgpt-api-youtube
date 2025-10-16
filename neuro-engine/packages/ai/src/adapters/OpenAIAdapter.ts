import OpenAI from 'openai';
import type { ClientOptions, MessageParam } from 'openai/resources/index.mjs';
import { z } from 'zod';

import type { AIAdapter, CompletionRequest, CompletionResponse } from './BaseAdapter.js';

const requestSchema = z.object({
  system: z.string().optional(),
  user: z.string().optional(),
  messages: z.array(z.custom<MessageParam>()).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(16).max(4096).optional(),
  metadata: z.record(z.any()).optional()
});

export interface OpenAIAdapterOptions extends ClientOptions {
  model?: string;
}

export class OpenAIAdapter implements AIAdapter {
  public readonly name = 'openai';
  private readonly client: OpenAI;
  private readonly defaultModel: string;

  constructor(options: OpenAIAdapterOptions) {
    if (!options.apiKey) {
      throw new Error('OpenAIAdapter requires an apiKey');
    }

    this.client = new OpenAI(options);
    this.defaultModel = options.model ?? 'gpt-4o-mini';
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const payload = requestSchema.parse(request);

    const messages: MessageParam[] = [];
    if (payload.system) {
      messages.push({ role: 'system', content: payload.system });
    }

    if (payload.messages?.length) {
      messages.push(...payload.messages);
    } else if (payload.user) {
      messages.push({ role: 'user', content: payload.user });
    }

    const raw = await this.client.chat.completions.create({
      model: this.defaultModel,
      messages,
      temperature: payload.temperature ?? 0.8,
      max_tokens: payload.maxTokens ?? 512,
      metadata: payload.metadata
    });

    const choice = raw.choices[0];
    const content = typeof choice.message.content === 'string'
      ? choice.message.content
      : Array.isArray(choice.message.content)
        ? choice.message.content.map((chunk) => chunk.text ?? '').join('\n')
        : '';

    return {
      id: raw.id,
      created: raw.created,
      content,
      raw
    };
  }
}
