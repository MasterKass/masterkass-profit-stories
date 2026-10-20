import { describe, it, expect } from "vitest";
import { discountFor } from "./pricing";

describe("скидка за развитие сети", () => {
  it("1 касса — без скидки", () => expect(discountFor(1)).toBe(0));
  it("2–3 кассы — 10%", () => expect(discountFor(3)).toBe(0.1));
  it("4–9 касс — 15%", () => expect(discountFor(9)).toBe(0.15));
  it("10+ касс — максимум 20%", () => expect(discountFor(25)).toBe(0.2));
});
