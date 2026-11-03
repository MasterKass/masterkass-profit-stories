import { z } from "zod";

/** Лид на партнёрскую программу: имя и почта, куда прислать полное описание. */
export const partnerLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Подскажите, как к вам обращаться")
    .max(100, "Имя слишком длинное"),
  email: z
    .string()
    .trim()
    .min(1, "Нужна почта: на неё придёт описание программы")
    .max(255, "Адрес слишком длинный")
    .toLowerCase()
    .email("Проверьте адрес почты: похоже, в нём опечатка"),
});

export type PartnerLeadValues = { name: string; email: string; company?: string };
export type PartnerLeadErrors = { name?: string; email?: string };
export type PartnerLeadResult =
  | { ok: true; value: { name: string; email: string } }
  | { ok: false; errors: PartnerLeadErrors };

/** Возвращает нормализованные контакты или первое сообщение по каждому полю. */
export function validatePartnerLead(values: PartnerLeadValues): PartnerLeadResult {
  const parsed = partnerLeadSchema.safeParse(values);
  if (parsed.success) return { ok: true, value: parsed.data };
  const errors: PartnerLeadErrors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if ((key === "name" || key === "email") && !errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
