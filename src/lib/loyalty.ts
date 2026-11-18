// Правила МК Бонус. Значения по умолчанию предварительные — ждут утверждения.
export type LoyaltyRules = { welcome: number; cashbackPct: number; maxSpendPct: number; burnDays: number };
export const DEFAULT_RULES: LoyaltyRules = { welcome: 200, cashbackPct: 5, maxSpendPct: 30, burnDays: 90 };

/** Сколько баллов можно списать в чек: не больше баланса и не больше лимита от суммы. 1 балл = 1 ₽. */
export function maxSpend(check: number, balance: number, r: LoyaltyRules): number {
  return Math.max(0, Math.min(balance, Math.floor((check * r.maxSpendPct) / 100)));
}
/** Начисление с оплаченной деньгами части чека. */
export function accrual(paid: number, r: LoyaltyRules): number {
  return Math.max(0, Math.floor((paid * r.cashbackPct) / 100));
}
