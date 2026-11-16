import { describe, it, expect } from "vitest";
import { unsentState, ofdSubState, OFD_PACKS } from "./ofd-watch";
const now = new Date("2026-11-16T12:00:00Z");
const ago = (d: number) => new Date(now.getTime() - d * 86_400_000);
describe("ОФД", () => {
  it("нет неотправленных — норма", () => expect(unsentState(0, null, now).tone).toBe("ok"));
  it("2 дня молчания — жёлтый", () => expect(unsentState(5, ago(2), now).tone).toBe("warn"));
  it("4 дня молчания — красный", () => expect(unsentState(5, ago(4), now).tone).toBe("bad"));
  it("до блокировки 30 дней минус молчание", () => expect(unsentState(1, ago(6), now).daysToBlock).toBe(24));
  it("подписка: за 30 дней предлагаем продление", () => expect(ofdSubState(new Date(now.getTime() + 20 * 86_400_000), now).offerRenewal).toBe(true));
  it("подписка: 60 дней — без предупреждения", () => expect(ofdSubState(new Date(now.getTime() + 60 * 86_400_000), now).tone).toBe("ok"));
  it("маржа пакетов 3100 и 8250", () => expect(OFD_PACKS.map((p) => p.margin)).toEqual([3100, 8250]));
});
