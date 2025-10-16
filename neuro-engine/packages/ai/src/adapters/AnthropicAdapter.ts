import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam } from '@anthropic-ai/sdk/resources/index.mjs';
import { z } from 'zod';

import type { AIAdapter, CompletionRequest, CompletionResponse } from './BaseAdapter.js';

const requestSchema = z.object({
  system: z.string().optional(),
  user: z.string().optional(),
  messages: z.array(z.custom<MessageParam>()).optional(),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().min(16).max(4096).optional()
});

export interface AnthropicAdapterOptions {
  apiKey: string;
  model?: string;
}

export class AnthropicAdapter implements AIAdapter {
  public readonly name = 'anthropic';
  private readonly client: Anthropic;
  private readonly defaultModel: string;

  constructor(options: AnthropicAdapterOptions) {
    if (!options.apiKey) {
      throw new Error('AnthropicAdapter requires an apiKey');
    }

    this.client = new Anthropic({ apiKey: options.apiKey });
    this.defaultModel = options.model ?? 'claude-3-5-sonnet-20240620';
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const payload = requestSchema.parse(request);
    const messages: MessageParam[] = payload.messages?.length
      ? payload.messages
      : payload.user
        ? [{ role: 'user', content: payload.user }]
        : [];

    const raw = await this.client.messages.create({
      model: this.defaultModel,
      max_tokens: payload.maxTokens ?? 512,
      temperature: payload.temperature ?? 0.7,
      system: payload.system,
      messages
    });

    const content = raw.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('\n');

    return {
      id: raw.id,
      created: Date.now(),
      content,
      raw
    };
  }
}
