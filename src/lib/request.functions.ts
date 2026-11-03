import { createServerFn } from "@tanstack/react-start";
import { requestSchema } from "./request";
import { z } from "zod";

const inputSchema = requestSchema.extend({ company: z.string().max(200).optional() });

/** Создаёт лид в Битрикс24 из заявки на сервис. Ключ вебхука хранится только на сервере. */
export const submitServiceRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    // Ловушка для ботов: делаем вид, что всё прошло успешно.
    if (data.company && data.company.trim()) return { ok: true as const };

    const base = process.env["BITRIX24_WEBHOOK_URL"];
    if (!base) return { ok: false as const, error: "not_configured" };

    const url = base.replace(/\/?$/, "/") + "crm.lead.add.json";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          TITLE: "Заявка на сервис с сайта МастерКасс",
          SOURCE_ID: "WEB",
          SOURCE_DESCRIPTION: "Форма «Подать заявку на сервис»",
          PHONE: [{ VALUE: data.phone, VALUE_TYPE: "WORK" }],
          EMAIL: [{ VALUE: data.email, VALUE_TYPE: "WORK" }],
          COMMENTS: "Клиент хочет протестировать сервис бесплатно 1 месяц.",
        },
        params: { REGISTER_SONET_EVENT: "Y" },
      }),
    });
    const json = (await res.json().catch(() => null)) as { result?: number; error?: string } | null;
    if (!res.ok || !json?.result) {
      console.error("Bitrix24 lead error", res.status, json?.error);
      return { ok: false as const, error: "crm_error" };
    }
    return { ok: true as const };
  });
