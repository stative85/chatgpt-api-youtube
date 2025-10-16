import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import Page from "./page";

vi.mock("@neuro-engine/ui", () => ({
  AtlasCanvas: ({ focusMetric, anxietyMetric }: { focusMetric: number; anxietyMetric: number }) => (
    <div data-testid="atlas">
      focus:{focusMetric} anxiety:{anxietyMetric}
    </div>
  )
}));

vi.mock("@neuro-engine/models", () => ({
  pulseFocusModel: () => ({ focus: 0.9, anxiety: 0.1 })
}));

vi.mock("@neuro-engine/schemas", () => ({
  studioSessionSchema: { parse: (value: unknown) => value }
}));

vi.mock("@neuro-engine/utils", () => ({
  formatLatency: (value: number) => `${value}ms`
}));

vi.mock("@neuro-engine/ai", () => ({
  PromptForge: class {
    register() {}
    build() {
      return [
        { role: "system", content: "system prompt" },
        { role: "user", content: "user prompt" }
      ];
    }
  },
  defaultPrompts: []
}));

vi.mock("@neuro-engine/promptforge", () => ({
  defaultBlueprints: [
    {
      compile: () => "ritual prompt"
    }
  ]
}));

describe("Page", () => {
  it("renders hero copy", () => {
    const { getByText } = render(<Page />);
    expect(getByText(/Neurodivergent Creativity Engine/)).toBeTruthy();
    expect(getByText(/Prompt blueprints/)).toBeTruthy();
  });
});
