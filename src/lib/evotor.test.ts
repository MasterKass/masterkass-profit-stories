import { describe, expect, it } from "vitest";
import { summarize, type EvotorDoc } from "./evotor";

const sell = (date: string, sum: number, type = "CASH"): EvotorDoc => ({
  type: "SELL", close_date: date, body: { result_sum: sum, payments: [{ type, sum }] },
});

describe("summarize", () => {
  it("считает выручку только за последний торговый день и вычитает возвраты", () => {
    const s = summarize([
      sell("2026-11-02T10:00:00.000+0000", 1000),
      sell("2026-11-03T08:00:00.000+0000", 500, "CASH"),
      sell("2026-11-03T09:00:00.000+0000", 300, "ELECTRON"),
      { type: "PAYBACK", close_date: "2026-11-03T09:30:00.000+0000", body: { result_sum: 100, payments: [{ type: "CASH", sum: 100 }] } },
    ]);
    expect(s.day).toBe("2026-11-03");
    expect(s.revenue).toBe(700);
    expect(s.cash).toBe(400);
    expect(s.card).toBe(300);
    expect(s.receipts).toBe(2);
    expect(s.avgCheck).toBe(350);
  });

  it("смена закрыта после CLOSE_SESSION", () => {
    const s = summarize([
      { type: "OPEN_SESSION", close_date: "2026-11-05T05:00:00.000+0000" },
      { type: "CLOSE_SESSION", close_date: "2026-11-05T15:00:00.000+0000" },
    ]);
    expect(s.sessionOpen).toBe(false);
  });
});
