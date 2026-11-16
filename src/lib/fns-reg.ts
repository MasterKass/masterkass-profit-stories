// Контроль перерегистрации ККТ после замены ФН: два итоговых статуса ФНС,
// 48 часов наблюдения за квитанцией и 30 дней на ручную подачу при отказе.
export const WATCH_HOURS = 48;
export const REFUSAL_DAYS = 30;
export const BITRIX_TASK_DAYS = 20;

export type FnsAnswer = "reregistered" | "refused";
export type RegCheck = { at: Date; answer: FnsAnswer; reason?: string };
export type RegState =
  | { kind: "watch"; hoursPassed: number; hoursLeft: number }
  | { kind: "confirmed" }
  | { kind: "refused"; reason: string; refusedAt: Date; daysLeft: number; taskDue: Date }
  | { kind: "deregistered" };

const H = 3_600_000, D = 24 * H;

export function regState(replacedAt: Date, checks: RegCheck[], now: Date): RegState {
  const refusal = checks.find((c) => c.answer === "refused");
  if (refusal) {
    const deadline = refusal.at.getTime() + REFUSAL_DAYS * D;
    if (now.getTime() >= deadline) return { kind: "deregistered" };
    return {
      kind: "refused", reason: refusal.reason ?? "Причина не указана", refusedAt: refusal.at,
      daysLeft: Math.ceil((deadline - now.getTime()) / D),
      taskDue: new Date(refusal.at.getTime() + BITRIX_TASK_DAYS * D),
    };
  }
  const passed = (now.getTime() - replacedAt.getTime()) / H;
  if (passed >= WATCH_HOURS) return { kind: "confirmed" };
  return { kind: "watch", hoursPassed: Math.max(0, Math.floor(passed)), hoursLeft: Math.ceil(WATCH_HOURS - Math.max(0, passed)) };
}

/** Адрес годится для автоперерегистрации, только если найден в ФИАС с номером дома. */
export type FiasResult = { found: boolean; houseNumber?: string };
export function addressRisk(r: FiasResult): "ok" | "refusal-risk" {
  return r.found && !!r.houseNumber?.trim() ? "ok" : "refusal-risk";
}

export type RescueData = { serial: string; rnm: string; closeDoc: string; closeSign: string; regDoc: string; regSign: string; newFn: string };
export function rescueLines(r: RescueData): [string, string][] {
  return [
    ["Заводской номер ККТ", r.serial], ["РН ККТ", r.rnm],
    ["Отчёт о закрытии ФН, №", r.closeDoc], ["ФП отчёта о закрытии", r.closeSign],
    ["Отчёт об изменении параметров, №", r.regDoc], ["ФП отчёта о перерегистрации", r.regSign],
    ["Номер нового ФН", r.newFn],
  ];
}
