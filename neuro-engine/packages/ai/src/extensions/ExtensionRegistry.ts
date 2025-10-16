export type ExtensionHandler = (...args: unknown[]) => Promise<unknown> | unknown;

export interface ExtensionDefinition {
  name: string;
  description?: string;
  version?: string;
  handler: ExtensionHandler;
}

export class ExtensionRegistry {
  private readonly extensions = new Map<string, ExtensionDefinition>();

  register(def: ExtensionDefinition) {
    if (this.extensions.has(def.name)) {
      throw new Error(`Extension ${def.name} already registered`);
    }
    this.extensions.set(def.name, def);
  }

  unregister(name: string) {
    this.extensions.delete(name);
  }

  async invoke<T = unknown>(name: string, ...args: unknown[]): Promise<T> {
    const extension = this.extensions.get(name);
    if (!extension) {
      throw new Error(`Extension ${name} not found`);
    }
    const result = await extension.handler(...args);
    return result as T;
  }

  list(): ExtensionDefinition[] {
    return Array.from(this.extensions.values());
  }
}

export const builtInExtensions: ExtensionDefinition[] = [
  {
    name: 'image.moodboard',
    description: 'Generates a JSON moodboard blueprint for a given concept.',
    handler: async (concept: string) => ({
      concept,
      palette: ['#332e54', '#ffc857', '#ffe5b4'],
      textures: ['holographic mist', 'woven copper'],
      soundtrack: 'lo-fi glitch pulses',
      callToAction: 'Prototype in websim.ai lab view'
    })
  },
  {
    name: 'audio.vibe-seed',
    description: 'Returns seed metadata for audio synthesis pipelines.',
    handler: async (mood: string) => ({
      mood,
      bpm: 92,
      scale: 'Dorian',
      instrumentation: ['granular pads', 'organic percussion'],
      modulation: 'Slow LFO sweep at 0.4Hz'
    })
  }
];
