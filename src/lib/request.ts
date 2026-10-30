import { z } from "zod";

/** Заявка на сервис: нужны только телефон и почта. */
export const requestSchema = z.object({
  phone: z
    .string()
    .trim()
    .max(24, "Телефон слишком длинный")
    .refine((v) => /^[0-9+().\-\s]+$/.test(v), "Телефон можно написать только цифрами")
    .transform((v) => v.replace(/\D/g, ""))
    .refine(
      (d) => (d.length === 11 && /^[78]/.test(d)) || d.length === 10,
      "Нужен номер из 10 цифр: например, +7 904 123-45-67",
    )
    .transform((d) => `+7${d.length === 11 ? d.slice(1) : d}`),
  email: z
    .string()
    .trim()
    .min(1, "Нужна почта: на неё придёт ответ")
    .max(255, "Адрес слишком длинный")
    .toLowerCase()
    .email("Проверьте адрес почты: похоже, в нём опечатка"),
});

export type RequestValues = { phone: string; email: string; company?: string };
export type RequestErrors = { phone?: string; email?: string };
export type RequestResult =
  | { ok: true; value: { phone: string; email: string } }
  | { ok: false; errors: RequestErrors };

/** Возвращает нормализованные контакты или первое сообщение по каждому полю. */
export function validateRequest(values: RequestValues): RequestResult {
  const parsed = requestSchema.safeParse(values);
  if (parsed.success) return { ok: true, value: parsed.data };
  const errors: RequestErrors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if ((key === "phone" || key === "email") && !errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
