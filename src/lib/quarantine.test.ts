import { describe, it, expect } from "vitest";
import { quarantineSummary, activeQuarantine } from "./quarantine";
const now = new Date("2026-11-16T12:00:00Z");
const d = (h: number) => new Date(now.getTime() - h * 3_600_000);
describe("карантин чеков", () => {
  it("считает только чеки за последние 7 дней", () => {
    expect(activeQuarantine([{ doc: "1", at: d(10), sum: 1, reason: "time" }, { doc: "2", at: d(24 * 8), sum: 1, reason: "time" }], now)).toHaveLength(1);
  });
  it("маркировка требует звонка клиенту", () => {
    expect(quarantineSummary([{ doc: "1", at: d(2), sum: 1, reason: "marking" }], now).needCall).toBe(true);
  });
  it("ошибка времени без звонка", () => {
    expect(quarantineSummary([{ doc: "1", at: d(2), sum: 1, reason: "time" }], now).needCall).toBe(false);
  });
});
