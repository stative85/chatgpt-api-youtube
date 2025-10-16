import { describe, expect, it } from "vitest";
import { buildServer } from "./index";

describe("buildServer", () => {
  it("responds to health", async () => {
    const app = await buildServer();
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });
});
