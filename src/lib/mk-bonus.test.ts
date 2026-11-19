import { describe, it, expect } from "vitest";
import { guestKeyFrom, redeemLimit } from "./mk-bonus";

describe("МК Бонус: списание", () => {
  it("не больше 30% чека", () => expect(redeemLimit(1000, 1000)).toBe(300));
  it("не больше остатка", () => expect(redeemLimit(50, 1000)).toBe(50));
  it("нулевой остаток — нечего списать", () => expect(redeemLimit(0, 1000)).toBe(0));
  it("телефон приводится к единому виду", () => expect(guestKeyFrom(null, "8 (903) 402-17-77")).toBe("phone:79034021777"));
});

import { normalizePercent as np } from "./mk-bonus";
describe("процент клиента", () => {
  it("свой процент 50 даёт списать половину чека", () => expect(redeemLimit(10_000, 1000, np(50))).toBe(500));
  it("неверное значение — стандартные 30%", () => { expect(np(150)).toBe(30); expect(np(null)).toBe(30); });
  it("0% запрещает списание", () => expect(redeemLimit(500, 1000, np(0))).toBe(0));
});
