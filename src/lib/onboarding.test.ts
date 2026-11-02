import { describe, expect, it } from "vitest";
import { firstChargeDate, startingUnits, findTariff, isValidEmail } from "./onboarding";

describe("onboarding", () => {
  it("first charge is 30 days after card binding", () => {
    expect(firstChargeDate(new Date(2026, 10, 2)).toDateString()).toBe(new Date(2026, 11, 2).toDateString());
  });
  it("partner link adds 300 units to tariff units", () => {
    expect(startingUnits("cyan", true)).toBe(600);
    expect(startingUnits("lime", false)).toBe(1000);
  });
  it("unknown tariff falls back to «Просто»", () => {
    expect(findTariff("x").name).toBe("Просто");
  });
  it("email validation", () => {
    expect(isValidEmail("a@b.ru")).toBe(true);
    expect(isValidEmail("ab.ru")).toBe(false);
  });
});
