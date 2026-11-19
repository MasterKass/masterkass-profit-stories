import { z } from "zod";
import { accrual, DEFAULT_RULES, type LoyaltyRules } from "./loyalty";

// Чек из «Эвотор» → «Чеки (ver.2)». Поля совпадают с галочками в кабинете разработчика.
const Item = z.object({
  id: z.string(),
  name: z.string().optional(),
  price: z.number().optional(),
  quantity: z.number().optional(),
  sumPrice: z.number().optional(),
  discount: z.number().optional(),
  costPrice: z.number().optional(),
  measureName: z.string().optional(),
  itemType: z.string().optional(),
}).passthrough();

export const ReceiptSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  type: z.string().optional(),
  data: z.object({
    id: z.string().optional(),
    type: z.string().optional(),
    storeId: z.string().optional(),
    deviceId: z.string().optional(),
    employeeId: z.string().optional(),
    shiftId: z.string().optional(),
    dateTime: z.string().optional(),
    paymentSource: z.string().optional(),
    totalAmount: z.number().optional(),
    totalDiscount: z.number().optional(),
    extras: z.record(z.string(), z.unknown()).optional(),
    items: z.array(Item).max(1000).default([]),
  }).passthrough(),
}).passthrough();
export type Receipt = z.infer<typeof ReceiptSchema>;

/** Карта гостя МК Бонус: приложение на кассе кладёт её в extras.mkBonusCard (или телефон в extras.mkBonusPhone). */
export function guestKey(r: Receipt): string | null {
  const ex = r.data.extras ?? {};
  const card = ex["mkBonusCard"], phone = ex["mkBonusPhone"];
  if (typeof card === "string" && card.trim()) return `card:${card.trim()}`;
  if (typeof phone === "string") { const d = phone.replace(/\D/g, ""); if (d.length >= 10) return `phone:7${d.slice(-10)}`; }
  return null;
}

/** Движение баллов по чеку: продажа начисляет, возврат отнимает. Без карты гостя — ничего. */
export function bonusMove(r: Receipt, rules: LoyaltyRules = DEFAULT_RULES): { guest: string; points: number } | null {
  const guest = guestKey(r);
  if (!guest) return null;
  const sum = Math.max(0, r.data.totalAmount ?? r.data.items.reduce((s, i) => s + (i.sumPrice ?? 0), 0));
  const pts = accrual(sum, rules);
  const t = (r.data.type ?? r.type ?? "").toUpperCase();
  return { guest, points: t.includes("PAYBACK") || t.includes("RETURN") ? -pts : pts };
}
