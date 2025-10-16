import { describe, expect, it } from "vitest";
import { studioSessionSchema } from "./index";

describe("studioSessionSchema", () => {
  it("validates a session", () => {
    const parsed = studioSessionSchema.parse({
      id: "abc",
      creator: "websim.ai",
      prompts: ["dream", "build"],
      latencyMs: 12,
      inspiration: "Keep iterating"
    });
    expect(parsed.id).toBe("abc");
    expect(parsed.inspiration).toBe("Keep iterating");
  });

  it("rejects invalid latency", () => {
    expect(() =>
      studioSessionSchema.parse({ id: "a", creator: "b", prompts: [], latencyMs: -1 })
    ).toThrowError();
  });
});
