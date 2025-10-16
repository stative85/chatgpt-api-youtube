import { z } from "zod";

export const studioSessionSchema = z.object({
  id: z.string(),
  creator: z.string(),
  prompts: z.array(z.string()),
  latencyMs: z.number().nonnegative(),
  inspiration: z.string().optional()
});

export type StudioSession = z.infer<typeof studioSessionSchema>;
