import { PromptForge, defaultPrompts, MemoryGraph } from "@neuro-engine/ai";
import { studioSessionSchema } from "@neuro-engine/schemas";
import { createTimer } from "@neuro-engine/utils";

export const typeDefs = /* GraphQL */ `
  type Query {
    studioSession(id: ID!): StudioSession!
  }

  type Mutation {
    updateIntensity(id: ID!, value: Float!): StudioSession!
  }

  type StudioSession {
    id: ID!
    creator: String!
    prompts: [String!]!
    latencyMs: Int!
    inspiration: String
  }
`;

const mockSession = {
  id: "demo",
  creator: "websim.ai",
  prompts: ["synesthetic sketching", "algorithmic lullaby"],
  latencyMs: 48
};

const forge = new PromptForge();
defaultPrompts.forEach((blueprint) => forge.register(blueprint));
const graph = new MemoryGraph();

graph.upsertNode({ id: "demo", label: "Demo Session" });

graph.upsertNode({ id: "prompt:lullaby", label: "Algorithmic Lullaby" });
graph.connect({ source: "demo", target: "prompt:lullaby", context: "seed" });

graph.upsertNode({ id: "prompt:sketch", label: "Synesthetic Sketch" });
graph.connect({ source: "demo", target: "prompt:sketch", context: "seed" });

function craftInspiration(id: string) {
  const nodes = graph.neighbors(id);
  if (!nodes.length) return undefined;
  const segments = forge.build("websim:lab-notes", {
    log: nodes.map((node) => node.label).join(" → ")
  });
  return segments.map((segment) => segment.content).join("\n");
}

export const resolvers = {
  Query: {
    studioSession: async (_: unknown, args: { id: string }) => {
      const timer = createTimer();
      const latencyMs = timer.stop();
      return studioSessionSchema.parse({
        ...mockSession,
        id: args.id,
        latencyMs,
        inspiration: craftInspiration("demo")
      });
    }
  },
  Mutation: {
    updateIntensity: async (_: unknown, args: { id: string; value: number }) => {
      const timer = createTimer();
      const latencyMs = timer.stop() + Math.round(args.value * 10);
      graph.upsertNode({ id: `signal:${args.id}`, label: `Signal ${args.value}` });
      graph.connect({ source: "demo", target: `signal:${args.id}`, context: "update" });
      return studioSessionSchema.parse({
        ...mockSession,
        id: args.id,
        latencyMs,
        inspiration: craftInspiration("demo")
      });
    }
  }
};
