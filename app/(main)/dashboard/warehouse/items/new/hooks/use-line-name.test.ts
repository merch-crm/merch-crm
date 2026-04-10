import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/utils/line-name-generator", () => ({
  generateLineName: vi.fn((attrs) => `Generated: ${JSON.stringify(attrs)}`),
  singularize: vi.fn((s: string) => s),
}));

describe("use-line-name hook", () => {
  it("module exports hook", async () => {
    const mod = await import("./use-line-name");
    expect(mod.useLineName).toBeDefined();
    expect(typeof mod.useLineName).toBe("function");
  });

  it("generateLineName is called with correct attributes", async () => {
    const { generateLineName } = await import("@/lib/utils/line-name-generator");

    const attrs = [
      { attributeId: "1", attributeName: "Brand", value: "Nike", attributeCode: "brand" },
      { attributeId: "2", attributeName: "Color", value: "White", attributeCode: "color" }
    ];
    generateLineName({ attributes: attrs });

    expect(generateLineName).toHaveBeenCalledWith({ attributes: attrs });
  });
});
