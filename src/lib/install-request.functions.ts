import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { installRequestSchema } from "./install-request";

const inputSchema = installRequestSchema.extend({ company: z.string().max(200).optional() });

/** Создаёт лид в Битрикс24: заявка на установку кассы со страницы каталога. */
export const submitInstallRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    if (data.company && data.company.trim()) return { ok: true as const };
    const base = process.env["BITRIX24_WEBHOOK_URL"];
    if (!base) return { ok: false as const, error: "not_configured" };
    const comments = [
      "Заявка на установку кассы со страницы «Кассы и оборудование».",
      data.business && `Бизнес / точка: ${data.business}`,
      data.comment && `Комментарий: ${data.comment}`,
    ].filter(Boolean).join("\n");
    const res = await fetch(base.replace(/\/?$/, "/") + "crm.lead.add.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          TITLE: `Установка кассы (${data.name})`,
          NAME: data.name,
          SOURCE_ID: "WEB",
          SOURCE_DESCRIPTION: "Страница «Кассы и оборудование»: заявка на установку кассы",
          PHONE: [{ VALUE: data.phone, VALUE_TYPE: "WORK" }],
          COMMENTS: comments,
        },
        params: { REGISTER_SONET_EVENT: "Y" },
      }),
    });
    const json = (await res.json().catch(() => null)) as { result?: number; error?: string } | null;
    if (!res.ok || !json?.result) {
      console.error("Bitrix24 install request error", res.status, json?.error);
      return { ok: false as const, error: "crm_error" };
    }
    return { ok: true as const };
  });
