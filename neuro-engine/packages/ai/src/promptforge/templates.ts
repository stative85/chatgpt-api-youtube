export interface PromptSegment {
  role: 'system' | 'user' | 'assistant';
  name?: string;
  content: string;
}

export interface PromptBlueprint {
  id: string;
  title: string;
  description: string;
  tags: string[];
  segments: PromptSegment[];
}

export class PromptForge {
  private readonly blueprints = new Map<string, PromptBlueprint>();

  register(blueprint: PromptBlueprint) {
    this.blueprints.set(blueprint.id, blueprint);
  }

  unregister(id: string) {
    this.blueprints.delete(id);
  }

  list(): PromptBlueprint[] {
    return Array.from(this.blueprints.values());
  }

  build(id: string, substitutions: Record<string, string> = {}): PromptSegment[] {
    const blueprint = this.blueprints.get(id);
    if (!blueprint) {
      throw new Error(`Prompt blueprint \"${id}\" not registered`);
    }

    return blueprint.segments.map((segment) => ({
      ...segment,
      content: segment.content.replace(/{{(.*?)}}/g, (_, key) => substitutions[key.trim()] ?? '')
    }));
  }
}

export const defaultPrompts: PromptBlueprint[] = [
  {
    id: 'websim:experience-designer',
    title: 'Websim Sensory Architect',
    description: 'Guides immersive scenario ideation for websim.ai worlds.',
    tags: ['websim.ai', 'creative', 'worldbuilding'],
    segments: [
      {
        role: 'system',
        content:
          'You are a neurodivergent-friendly architect who designs multisensory prototypes inside websim.ai. Focus on accessibility, novelty, and playful experimentation.'
      },
      {
        role: 'user',
        content:
          'Synthesize an experience that helps builders explore {{theme}} using modalities {{modalities}}. Provide scaffolding for rapid iteration.'
      }
    ]
  },
  {
    id: 'websim:lab-notes',
    title: 'Lab Notebook Summarizer',
    description: 'Compresses research sessions into action items.',
    tags: ['summary', 'operations'],
    segments: [
      {
        role: 'system',
        content:
          'You are a meticulous research librarian translating raw lab logs into structured follow-ups for the Neuro-Engine collective.'
      },
      {
        role: 'user',
        content: 'Summarize the following lab log and highlight blockers:\n\n{{log}}'
      }
    ]
  }
];
