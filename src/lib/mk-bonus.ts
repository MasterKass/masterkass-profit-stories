// Правила «МК Бонус» для кассы. Лимит списания — доля чека, которую можно оплатить баллами.
export const REDEEM_LIMIT_PERCENT = 30;

export function guestKeyFrom(card?: string | null, phone?: string | null): string | null {
  const c = card?.trim();
  if (c) return c.length <= 64 ? `card:${c}` : null;
  const dg = (phone ?? "").replace(/\D/g, "");
  return dg.length >= 10 ? `phone:7${dg.slice(-10)}` : null;
}

/** Сколько баллов можно списать: не больше остатка и не больше лимита от суммы чека (1 балл = 1 ₽). */
export function redeemLimit(balance: number, amount: number, percent = REDEEM_LIMIT_PERCENT): number {
  if (!(balance > 0) || !(amount > 0)) return 0;
  return Math.max(0, Math.min(Math.floor(balance), Math.floor((amount * percent) / 100)));
}

export function checkToken(request: Request): boolean {
  const secret = process.env["EVOTOR_WEBHOOK_TOKEN"];
  const auth = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  return !!secret && auth === secret;
}
