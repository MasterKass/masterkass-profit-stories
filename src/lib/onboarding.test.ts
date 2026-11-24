import { describe, expect, it } from "vitest";
import { firstChargeDate, startingUnits, findTariff, isValidEmail, isValidPhone, resumeTrialStep } from "./onboarding";
import { validateRequest } from "./request";

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
  it("restores legacy leads without a phone to contacts even with a tariff", () => {
    expect(resumeTrialStep({})).toBe(0);
    expect(resumeTrialStep({}, "cyan")).toBe(0);
    expect(resumeTrialStep({ phone: "" }, "cyan")).toBe(0);
    expect(resumeTrialStep({ phone: "123" }, "cyan")).toBe(0);
  });
  it("resumes a lead with a valid phone at tariff selection or register connection", () => {
    expect(resumeTrialStep({ phone: "+7 904 123-45-67" })).toBe(1);
    expect(resumeTrialStep({ phone: "+79041234567" }, "cyan")).toBe(2);
  });
  it("normalizes ten-digit contact input into a phone accepted by register linking", () => {
    const result = validateRequest({ phone: "9041234567", email: "join-test@example.com" });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected valid contacts");
    expect(result.value.phone).toBe("+79041234567");
    expect(isValidPhone(result.value.phone)).toBe(true);
    const saved = JSON.parse(JSON.stringify({ dealId: 0, ...result.value })) as { phone: string };
    expect(saved.phone).toBe("+79041234567");
    expect(resumeTrialStep(saved)).toBe(1);
  });
});
