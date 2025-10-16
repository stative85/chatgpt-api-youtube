import { describe, expect, it } from "vitest";
import { createTimer, formatLatency } from "./index";

describe("createTimer", () => {
  it("produces a numeric latency", () => {
    const timer = createTimer();
    const value = timer.stop();
    expect(typeof value).toBe("number");
    expect(value).toBeGreaterThanOrEqual(0);
  });
});

describe("formatLatency", () => {
  it("formats milliseconds", () => {
    expect(formatLatency(42)).toBe("42ms");
  });

  it("formats seconds", () => {
    expect(formatLatency(1500)).toBe("1.5s");
  });
});
