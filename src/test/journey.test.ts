import { describe, expect, it } from "vitest";
import { journeyStage, routeFraction, easeFrame } from "@/components/portfolio/journey-motion";

describe("Journey interaction rules", () => {
  it("does not start from scroll progress before explicit activation", () => {
    expect(journeyStage(false, 4, 8)).toBe(-1);
    expect(journeyStage(true, 4, 8)).toBe(4);
  });
  it("keeps the arrow on the heart route throughout the journey", () => {
    expect(routeFraction(0, 8)).toBe(0.04);
    expect(routeFraction(7, 8)).toBeCloseTo(0.96);
    expect(routeFraction(20, 8)).toBeCloseTo(0.96);
  });
  it("moves toward a new stop without jumping straight to it", () => {
    const next = easeFrame(0.04, 0.96, 16);
    expect(next).toBeGreaterThan(0.04);
    expect(next).toBeLessThan(0.2);
  });
});