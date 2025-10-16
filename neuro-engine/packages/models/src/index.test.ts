import { describe, expect, it } from "vitest";
import { pulseFocusModel } from "./index";

describe("pulseFocusModel", () => {
  it("returns normalized metrics", () => {
    const signal = pulseFocusModel(0.5);
    expect(signal.focus).toBeGreaterThan(0);
    expect(signal.focus).toBeLessThanOrEqual(1);
    expect(signal.anxiety).toBeGreaterThanOrEqual(0);
    expect(signal.anxiety).toBeLessThanOrEqual(1);
  });
});
