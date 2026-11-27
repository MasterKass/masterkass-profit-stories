import { z } from "zod";
import { normalizePhone } from "./login";

/** Заявка на установку кассы со страницы «Кассы и оборудование». */
export const installRequestSchema = z.object({
  name: z.string().trim().min(1, "Подскажите, как к вам обращаться").max(100, "Имя слишком длинное"),
  phone: z
    .string()
    .trim()
    .max(30, "Проверьте номер телефона")
    .refine((v) => normalizePhone(v) !== null, "Проверьте номер телефона: нужен российский номер")
    .transform((v) => normalizePhone(v) as string),
  business: z.string().trim().max(200, "Слишком длинно").optional().default(""),
  comment: z.string().trim().max(1000, "Комментарий слишком длинный").optional().default(""),
});

export type InstallRequestValues = { name: string; phone: string; business?: string; comment?: string };
export type InstallRequestErrors = Partial<Record<"name" | "phone" | "business" | "comment", string>>;

export function validateInstallRequest(values: InstallRequestValues) {
  const parsed = installRequestSchema.safeParse(values);
  if (parsed.success) return { ok: true as const, value: parsed.data };
  const errors: InstallRequestErrors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof InstallRequestErrors;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { ok: false as const, errors };
}
