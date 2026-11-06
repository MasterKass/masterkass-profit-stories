import { createServerFn } from "@tanstack/react-start";
import { requestSchema } from "./request";
import { z } from "zod";
import { TRIAL_STAGES, TRIAL_STAGE_IDS } from "./onboarding";

const inputSchema = requestSchema.extend({
  company: z.string().max(200).optional(),
  tariff: z.string().max(40).optional(),
  source: z.string().max(80).optional(),
  ref: z.string().max(80).optional(),
});

async function bx(method: string, body: unknown) {
  const base = process.env["BITRIX24_WEBHOOK_URL"];
  if (!base) return { ok: false as const, error: "not_configured" };
  const res = await fetch(base.replace(/\/?$/, "/") + method + ".json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as { result?: unknown; error?: string } | null;
  if (!res.ok || !json?.result) {
    console.error("Bitrix24 error", method, res.status, json?.error);
    return { ok: false as const, error: "crm_error" };
  }
  return { ok: true as const, result: json.result };
}

/** Первый шаг подключения: контакт + сделка в Битрикс24. Ключ вебхука только на сервере. */
export const submitServiceRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    if (data.company && data.company.trim()) return { ok: true as const, dealId: 0 };

    const contact = await bx("crm.contact.add", {
      fields: {
        NAME: "Клиент с сайта",
        SOURCE_ID: "WEB",
        PHONE: [{ VALUE: data.phone, VALUE_TYPE: "WORK" }],
        EMAIL: [{ VALUE: data.email, VALUE_TYPE: "WORK" }],
      },
    });
    if (!contact.ok) return { ok: false as const, error: contact.error };

    const stage = data.tariff ? TRIAL_STAGES.tariff : TRIAL_STAGES.contacts;
    const deal = await bx("crm.deal.add", {
      fields: {
        TITLE: `Подключение с сайта: ${stage}${data.tariff ? ` · тариф ${data.tariff}` : ""}`,
        CONTACT_ID: contact.result,
        STAGE_ID: data.tariff ? TRIAL_STAGE_IDS.tariff : TRIAL_STAGE_IDS.contacts,
        SOURCE_ID: "WEB",
        SOURCE_DESCRIPTION: data.source ?? "Сайт",
        COMMENTS: [
          `Этап: ${stage}`,
          data.tariff ? `Тариф: ${data.tariff}` : "Тариф ещё не выбран",
          data.ref ? `Партнёр: ${data.ref}` : "",
          `Телефон: ${data.phone}, почта: ${data.email}`,
        ].filter(Boolean).join("\n"),
      },
      params: { REGISTER_SONET_EVENT: "Y" },
    });
    if (!deal.ok) return { ok: false as const, error: deal.error };
    return { ok: true as const, dealId: Number(deal.result) };
  });

/** Двигает ту же сделку по этапам подключения. */
export const updateTrialDeal = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({
      dealId: z.number().int().positive(),
      stage: z.enum(["tariff", "cash", "started"]),
      tariff: z.string().max(40).optional(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const stage = TRIAL_STAGES[data.stage];
    const r = await bx("crm.deal.update", {
      id: data.dealId,
      fields: { STAGE_ID: TRIAL_STAGE_IDS[data.stage], TITLE: `Подключение с сайта: ${stage}${data.tariff ? ` · тариф ${data.tariff}` : ""}` },
    });
    if (r.ok) await bx("crm.timeline.comment.add", { fields: { ENTITY_ID: data.dealId, ENTITY_TYPE: "deal", COMMENT: `Этап: ${stage}${data.tariff ? `, тариф ${data.tariff}` : ""}` } });
    return { ok: r.ok };
  });
