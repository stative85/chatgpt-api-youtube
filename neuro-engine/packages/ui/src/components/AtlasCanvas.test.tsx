import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AtlasCanvas } from "./AtlasCanvas";

describe("AtlasCanvas", () => {
  it("renders prompts", () => {
    const { getByText } = render(
      <AtlasCanvas prompts={["a", "b"]} focusMetric={0.5} anxietyMetric={0.2} />
    );
    expect(getByText("a")).toBeTruthy();
    expect(getByText("b")).toBeTruthy();
  });
});
