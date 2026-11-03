import { createServerFn } from "@tanstack/react-start";
import { partnerLeadSchema } from "./partner-lead";
import { z } from "zod";

const inputSchema = partnerLeadSchema.extend({ company: z.string().max(200).optional() });

/** Создаёт лид в Битрикс24 от человека, который просит описание партнёрской программы. */
export const submitPartnerLead = createServerFn({ method: "POST" })
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
          TITLE: `Партнёрка: описание программы (${data.name})`,
          NAME: data.name,
          SOURCE_ID: "WEB",
          SOURCE_DESCRIPTION: "Страница «Партнёрская программа»: запрос описания на почту",
          EMAIL: [{ VALUE: data.email, VALUE_TYPE: "WORK" }],
          COMMENTS: "Просит прислать полное описание партнёрской программы на почту.",
        },
        params: { REGISTER_SONET_EVENT: "Y" },
      }),
    });
    const json = (await res.json().catch(() => null)) as { result?: number; error?: string } | null;
    if (!res.ok || !json?.result) {
      console.error("Bitrix24 partner lead error", res.status, json?.error);
      return { ok: false as const, error: "crm_error" };
    }
    return { ok: true as const };
  });
