import { z } from 'zod';

export interface PromptCompiler<TParams extends Record<string, unknown>> {
  id: string;
  meta: {
    title: string;
    description: string;
    tags: string[];
  };
  schema: z.ZodType<TParams>;
  compile(params: TParams): string;
}

type PromptFactory = <TParams extends Record<string, unknown>>(
  id: string,
  config: {
    title: string;
    description: string;
    tags?: string[];
    schema: z.ZodType<TParams>;
    template: string;
  }
) => PromptCompiler<TParams>;

export const createPrompt: PromptFactory = (id, config) => {
  const schema = config.schema;
  return {
    id,
    meta: {
      title: config.title,
      description: config.description,
      tags: config.tags ?? []
    },
    schema,
    compile(params) {
      const input = schema.parse(params);
      return config.template.replace(/{{(.*?)}}/g, (_, key) => {
        const value = input[key.trim() as keyof typeof input];
        return value === undefined ? '' : String(value);
      });
    }
  };
};

export const defaultBlueprints = [
  createPrompt('brainstorm:ritual', {
    title: 'Ritual Brainstorm',
    description: 'Craft a ritual experience concept for websim.ai explorers.',
    tags: ['websim.ai', 'ritual'],
    schema: z.object({
      modality: z.string(),
      tone: z.string()
    }),
    template:
      'Design a {{tone}} ritual inside websim.ai using the {{modality}} modality. Outline beats, sensory cues, and next steps.'
  }),
  createPrompt('ops:status-ping', {
    title: 'BuilderOps Status Ping',
    description: 'Standardised status update skeleton.',
    schema: z.object({
      focus: z.string(),
      blockers: z.string().optional()
    }),
    template:
      'Focus today: {{focus}}. Blockers: {{blockers}}. Translate into async update for the Neuro-Engine guild.'
  })
];
