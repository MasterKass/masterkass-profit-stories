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

/** Доля чека клиента: целое 0–100, иначе стандартная. */
export function normalizePercent(v: unknown): number {
  if (v === null || v === undefined || v === "") return REDEEM_LIMIT_PERCENT;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= 100 ? n : REDEEM_LIMIT_PERCENT;
}

/** Процент списания конкретного клиента Эвотора (из его кабинета). */
export async function accountPercent(evotorUserId?: string | null): Promise<number> {
  if (!evotorUserId) return REDEEM_LIMIT_PERCENT;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("mk_evotor_accounts").select("redeem_percent").eq("evotor_user_id", evotorUserId).maybeSingle();
  return normalizePercent(data?.redeem_percent);
}
