// Сверка смен: данные кассы (Z-отчёт) против данных, принятых ОФД.
export const SHIFT_MAX_HOURS = 24;
export const SUM_TOLERANCE = 0.01; // копейки на округление

export type ShiftData = { shift: number; sales: number; refunds: number; cash: number; card: number; checks: number };
export type ShiftCheck = { register: ShiftData; ofd: ShiftData | null; openedAt: Date; closedAt: Date | null };
export type Issue = { kind: "missing" | "revenue" | "checks" | "payments" | "long_shift"; text: string; diff?: number };

const rub = (n: number) => `${n.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽`;
export const revenue = (d: ShiftData) => d.sales - d.refunds;

export function reconcileShift(s: ShiftCheck, now: Date): { tone: "ok" | "warn" | "bad"; issues: Issue[] } {
  const issues: Issue[] = [];
  const hours = ((s.closedAt ?? now).getTime() - s.openedAt.getTime()) / 3_600_000;
  if (!s.closedAt && hours > SHIFT_MAX_HOURS)
    issues.push({ kind: "long_shift", text: `Смена №${s.register.shift} открыта ${Math.floor(hours)} ч — больше 24 часов, нужно закрыть смену.` });
  if (s.closedAt && !s.ofd) {
    issues.push({ kind: "missing", text: `Смена №${s.register.shift} закрыта на кассе, но отчёт о закрытии ещё не поступил в ОФД.` });
  } else if (s.ofd) {
    const diff = +(revenue(s.register) - revenue(s.ofd)).toFixed(2);
    if (Math.abs(diff) > SUM_TOLERANCE)
      issues.push({ kind: "revenue", diff, text: `Выручка по кассе ${rub(revenue(s.register))}, в ОФД ${rub(revenue(s.ofd))}: разница ${rub(Math.abs(diff))}.` });
    const dc = s.register.checks - s.ofd.checks;
    if (dc !== 0) issues.push({ kind: "checks", text: `Чеков по кассе ${s.register.checks}, в ОФД ${s.ofd.checks}: ${Math.abs(dc)} ещё не дошли.` });
    if (Math.abs(diff) <= SUM_TOLERANCE && (Math.abs(s.register.cash - s.ofd.cash) > SUM_TOLERANCE || Math.abs(s.register.card - s.ofd.card) > SUM_TOLERANCE))
      issues.push({ kind: "payments", text: "Итог совпал, но наличные и безналичные разнесены по-разному — проверьте тип оплаты в чеках." });
  }
  const tone = issues.length === 0 ? "ok" : issues.some((i) => i.kind === "missing" || i.kind === "long_shift" || (i.diff !== undefined && Math.abs(i.diff) >= 1000)) ? "bad" : "warn";
  return { tone, issues };
}
