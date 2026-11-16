// Неотправленные чеки (54-ФЗ: 30 дней без передачи в ОФД — блокировка ФН)
// и срок оплаченной подписки ОФД (напоминание за 30 дней, пакеты 15/36 мес).
const D = 86_400_000;
export const FN_BLOCK_DAYS = 30;
export const OFD_ALERT_DAYS = 30;

export type Tone = "ok" | "warn" | "bad";

export function unsentState(count: number, oldest: Date | null, now: Date) {
  if (!count || !oldest) return { tone: "ok" as Tone, daysSilent: 0, daysToBlock: FN_BLOCK_DAYS };
  const daysSilent = Math.floor((now.getTime() - oldest.getTime()) / D);
  const daysToBlock = Math.max(0, FN_BLOCK_DAYS - daysSilent);
  const tone: Tone = daysSilent > 3 || daysToBlock < 7 ? "bad" : "warn";
  return { tone, daysSilent, daysToBlock };
}

export const OFD_PACKS = [
  { months: 15, cost: 400, price: 3500 },
  { months: 36, cost: 750, price: 9000 },
].map((p) => ({ ...p, margin: p.price - p.cost }));

export function ofdSubState(until: Date, now: Date) {
  const daysLeft = Math.ceil((until.getTime() - now.getTime()) / D);
  const tone: Tone = daysLeft <= 0 ? "bad" : daysLeft <= OFD_ALERT_DAYS ? "warn" : "ok";
  return { daysLeft, tone, offerRenewal: daysLeft <= OFD_ALERT_DAYS };
}
