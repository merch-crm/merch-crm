import { describe, it, expect } from "vitest";
import { performCalculation } from "../calculation-logic";
import type { ApplicationType, PrintGroupInput, ConsumablesConfigData } from "../../types";

describe("calculation-logic", () => {
  const defaultPricing = [{
    id: "1",
    applicationType: "dtf" as ApplicationType,
    rollWidthMm: 600,
    sortOrder: 1,
    isActive: true,
    fromMeters: 0,
    toMeters: null,
    pricePerMeter: 1000
  }];
  const defaultConsumables: ConsumablesConfigData = {
    applicationType: "dtf" as ApplicationType,
    inkWhitePerM2: 10,
    inkCmykPerM2: 5,
    powderPerM2: 20,
    paperPerM2: 15,
    fillPercent: 100,
    wastePercent: 5,
    config: null,
  };

  it("should calculate correct layout for a single group", () => {
    const groups: PrintGroupInput[] = [{
      id: "1",
      widthMm: 100,
      heightMm: 100,
      quantity: 10,
      name: "Test",
      placementId: null,
      color: "White",
    }];

    const result = performCalculation({
      applicationType: "dtf" as ApplicationType,
      rollWidthMm: 600,
      edgeMarginMm: 10,
      printGapMm: 5,
      groups,
      pricing: defaultPricing,
      consumables: defaultConsumables,
      placements: [],
    });

    // 600 - 2*10 = 580 working width
    // (580 + 5) / (100 + 5) = 5.57 -> 5 prints per row
    // 10 / 5 = 2 rows
    // 2 * (100 + 5) = 210 mm total length
    expect(result.sections[0].printsPerRow).toBe(5);
    expect(result.sections[0].rowsCount).toBe(2);
    expect(result.totalLengthM).toBe(0.21);
    expect(result.totalPrints).toBe(10);
    expect(result.pricePerMeter).toBe(1000);
    expect(result.printCost).toBe(210); // 0.21 * 1000
  });

  it("should handle empty groups", () => {
    const result = performCalculation({
      applicationType: "dtf" as ApplicationType,
      rollWidthMm: 600,
      edgeMarginMm: 10,
      printGapMm: 5,
      groups: [],
      pricing: defaultPricing,
      consumables: defaultConsumables,
      placements: [],
    });

    expect(result.totalPrints).toBe(0);
    expect(result.totalLengthM).toBe(0);
    expect(result.sections).toHaveLength(0);
  });
});
