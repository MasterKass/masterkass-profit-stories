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

import { fnLife, fnTermMonths } from "./evotor";

describe("fnLife", () => {
  it("ФН серии 738x служит 36 месяцев от первого документа", () => {
    const l = fnLife("7381440900838685", "2025-06-10T07:51:43.000+0000", Date.parse("2026-11-05T00:00:00Z"));
    expect(l?.until).toBe("2028-06-10");
    expect(l?.daysLeft).toBe(583);
  });
  it("ФН серии 728x служит 15 месяцев", () => {
    expect(fnTermMonths("7281000000000000")).toBe(15);
  });
  it("неизвестная серия: срок не показываем", () => {
    expect(fnLife("9283440300258493", "2019-06-13T00:00:00Z")).toBeNull();
  });
});

import { fnNeedsAlert } from "./evotor";

describe("fnNeedsAlert: предупреждение за 30 дней", () => {
  const base = { since: "2025-06-10", until: "2028-06-10", months: 36 };
  it("31 день: рано", () => expect(fnNeedsAlert({ ...base, daysLeft: 31 })).toBe(false));
  it("30 дней: предупреждаем", () => expect(fnNeedsAlert({ ...base, daysLeft: 30 })).toBe(true));
  it("срок истёк: предупреждаем", () => expect(fnNeedsAlert({ ...base, daysLeft: -3 })).toBe(true));
  it("нет данных: молчим", () => expect(fnNeedsAlert(null)).toBe(false));
});
