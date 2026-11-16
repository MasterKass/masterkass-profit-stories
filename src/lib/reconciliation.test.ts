import { describe, it, expect } from "vitest";
import { reconcileShift, type ShiftData } from "./reconciliation";
const now = new Date("2026-11-16T20:00:00Z");
const h = (n: number) => new Date(now.getTime() - n * 3_600_000);
const d: ShiftData = { shift: 12, sales: 8375.9, refunds: 0, cash: 2000, card: 6375.9, checks: 17 };
describe("сверка смен с ОФД", () => {
  it("всё совпало — норма", () => expect(reconcileShift({ register: d, ofd: d, openedAt: h(12), closedAt: h(1) }, now).tone).toBe("ok"));
  it("закрыта, но нет в ОФД — срочно", () => expect(reconcileShift({ register: d, ofd: null, openedAt: h(12), closedAt: h(1) }, now).issues[0]!.kind).toBe("missing"));
  it("разница выручки 1 200 ₽ — срочно", () => {
    const r = reconcileShift({ register: d, ofd: { ...d, sales: 7175.9, card: 5175.9, checks: 16 }, openedAt: h(12), closedAt: h(1) }, now);
    expect(r.tone).toBe("bad"); expect(r.issues.find((i) => i.kind === "revenue")!.diff).toBe(1200);
  });
  it("смена открыта больше 24 часов", () => expect(reconcileShift({ register: d, ofd: null, openedAt: h(26), closedAt: null }, now).issues[0]!.kind).toBe("long_shift"));
  it("итог совпал, оплаты разнесены иначе — внимание", () => {
    const r = reconcileShift({ register: d, ofd: { ...d, cash: 2500, card: 5875.9 }, openedAt: h(12), closedAt: h(1) }, now);
    expect(r.tone).toBe("warn"); expect(r.issues[0]!.kind).toBe("payments");
  });
});
