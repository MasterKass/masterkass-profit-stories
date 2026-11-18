import { describe, it, expect } from "vitest";
import { DEFAULT_RULES as R, maxSpend, accrual } from "./loyalty";
describe("МК Бонус", () => {
  it("списание не больше 30% чека", () => expect(maxSpend(1000, 5000, R)).toBe(300));
  it("списание не больше баланса", () => expect(maxSpend(1000, 120, R)).toBe(120));
  it("кешбэк 5% с оплаченной части", () => expect(accrual(700, R)).toBe(35));
});
