import { describe, it, expect } from "vitest";
import { ReceiptSchema, bonusMove } from "./evotor-receipt";
const mk = (type: string, extras: Record<string, unknown>) =>
  ReceiptSchema.parse({ id: "r1", data: { type, totalAmount: 1000, extras, items: [{ id: "i1", sumPrice: 1000 }] } });
describe("чек Эвотора → МК Бонус", () => {
  it("продажа 1000 ₽ по карте начисляет 50 баллов", () => expect(bonusMove(mk("SELL", { mkBonusCard: "MK123" }))).toEqual({ guest: "card:MK123", points: 50 }));
  it("возврат отнимает баллы", () => expect(bonusMove(mk("PAYBACK", { mkBonusPhone: "8 (903) 402-17-77" }))?.points).toBe(-50));
  it("чек без карты гостя баллы не трогает", () => expect(bonusMove(mk("SELL", {}))).toBeNull());
});
