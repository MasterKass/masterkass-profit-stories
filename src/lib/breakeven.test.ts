import { describe, expect, it } from "vitest";
import { breakeven, cashMargin, BE_TARIFFS } from "./breakeven";

describe("breakeven", () => {
  it("маржа кассы за вычетом фонда 750 ₽ и юнитов", () => {
    expect(BE_TARIFFS.map(cashMargin)).toEqual([900, 2100, 2400]);
  });
  it("дефицит переводится в целое число касс по каждому тарифу", () => {
    const r = breakeven([70000, 25000, 15000, 10000], [0, 10, 0]);
    expect(r.balance).toBe(-99000);
    expect(r.need).toEqual([110, 48, 42]);
  });
  it("при прибыли добирать кассы не нужно", () => {
    expect(breakeven([1000, 0, 0, 0], [0, 1, 0]).need).toEqual([0, 0, 0]);
  });
});
