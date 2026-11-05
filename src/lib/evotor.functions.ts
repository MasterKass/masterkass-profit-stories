import { createServerFn } from "@tanstack/react-start";
import { fnNeedsAlert, fnReplacementTask, linkStatus } from "./evotor";
import { bitrixRoot, loadCabinet, runLinkSilenceCheck } from "./evotor.server";

export const getEvotorCabinet = createServerFn({ method: "GET" }).handler(async () => {
  const cab = await loadCabinet();
  if (!cab.ok) return cab;
  const { events: _events, ...rest } = cab;
  return rest;
});

const sentTasks = new Map<string, number>();

// Задача в Битрикс24 на замену ФН. Данные ФН берём с кассы на сервере, браузеру не доверяем.
// test: true разрешает отправку до наступления 30 дней (с пометкой «ТЕСТ»).
export const createFnReplacementTask = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ({ test: !!(d as { test?: boolean } | null)?.test }))
  .handler(async ({ data }) => {
    const root = bitrixRoot();
    if (!root) return { ok: false as const, error: "Битрикс24 не подключён" };
    const cab = await loadCabinet();
    if (!cab.ok || !cab.fn || !cab.summary.fnSerial) return { ok: false as const, error: "Нет данных о сроке ФН" };
    if (!data.test && !fnNeedsAlert(cab.fn)) return { ok: false as const, error: "До конца срока ФН больше 30 дней" };
    const key = `${cab.summary.fnSerial}:${data.test}`;
    const last = sentTasks.get(key);
    if (last && Date.now() - last < 10 * 60000) return { ok: false as const, error: "Задача уже создана недавно" };

    const t = fnReplacementTask({ fn: cab.fn, fnSerial: cab.summary.fnSerial, store: cab.store, kkt: cab.summary.kktReg, test: data.test });
    const responsible = Number(process.env["BITRIX24_RESPONSIBLE_ID"] ?? 1);
    const res = await fetch(root + "tasks.task.add.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { TITLE: t.title, DESCRIPTION: t.description, RESPONSIBLE_ID: responsible, DEADLINE: `${t.deadline}T18:00:00+03:00` } }),
    });
    const j = (await res.json().catch(() => null)) as { result?: { task?: { id?: string } }; error?: string; error_description?: string } | null;
    const taskId = j?.result?.task?.id;
    if (res.ok && taskId) {
      sentTasks.set(key, Date.now());
      return { ok: true as const, kind: "task" as const, id: String(taskId) };
    }
    console.error("Bitrix24 task error", res.status, j?.error, j?.error_description);
    const lead = await fetch(root + "crm.lead.add.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { TITLE: t.title, SOURCE_ID: "OTHER", COMMENTS: t.description.replace(/\n/g, "<br>") } }),
    });
    const lj = (await lead.json().catch(() => null)) as { result?: number; error?: string } | null;
    if (lead.ok && lj?.result) {
      sentTasks.set(key, Date.now());
      return { ok: true as const, kind: "lead" as const, id: String(lj.result) };
    }
    console.error("Bitrix24 lead fallback error", lead.status, lj?.error);
    return { ok: false as const, error: "Битрикс24 не принял задачу" };
  });

// Задача в Битрикс24, если касса молчит 7+ дней. Повтор не чаще раза в сутки на кассу.
export const createLinkSilenceTask = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ({ test: !!(d as { test?: boolean } | null)?.test }))
  .handler(async ({ data }) => runLinkSilenceCheck(data.test));

// AI-диагностика: владелец описывает проблему, модель составляет план по статусу связи и событиям кассы.
export const troubleshootCashRegister = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => {
    const problem = String((d as { problem?: unknown } | null)?.problem ?? "").trim().slice(0, 1500);
    if (problem.length < 3) throw new Error("Опишите проблему чуть подробнее");
    return { problem };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "AI-помощник не настроен" };
    const cab = await loadCabinet();
    const link = cab.ok ? linkStatus(cab.summary.lastEventAt) : null;
    const context = cab.ok
      ? [
          `Точка: ${cab.store}`,
          `Кассы: ${cab.devices.map((d) => `${d.model} № ${d.serial}`).join("; ") || "нет данных"}`,
          `Связь: ${link ? `${link.level}, ${link.label}` : "нет данных"}`,
          `Последнее событие: ${cab.summary.lastEventAt ?? "нет"}`,
          `Смена: ${cab.summary.sessionOpen ? "открыта" : "закрыта"}`,
          `ФН: ${cab.fn ? `до ${cab.fn.until}, осталось ${cab.fn.daysLeft} дн.` : "срок неизвестен"}`,
          `История событий (новые сверху): ${cab.events.map((e) => `${e.type} ${e.at}`).join(", ") || "пусто"}`,
        ].join("\n")
      : `Данные с кассы недоступны: ${cab.error}`;

    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const openai = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      let failure: unknown = null;
      const result = streamText({
        model: openai.responses("openai/gpt-6-astra"),
        maxRetries: 0,
        system:
          "Ты инженер сервиса МастерКасс с 9-летним опытом по кассам Эвотор и Касатка. Отвечай по-русски, тепло и по делу, без длинных тире. " +
          "Составь короткий план устранения неполадки: 1) вероятная причина с опорой на статус связи и историю событий, 2) пронумерованные шаги для кассира (3–6 шагов), " +
          "3) когда звать инженера МастерКасс. Не предлагай перепрошивку, настройку ФН или вмешательство в фискальные данные: это делает только инженер. " +
          "Помни, что без передачи чеков в ОФД 30 дней ФН блокируется.",
        prompt: `Данные кассы:\n${context}\n\nОписание проблемы от владельца:\n${data.problem}`,
        providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", store: false } },
        onError: ({ error }) => { failure = error; },
      });
      const text = (await result.text).trim();
      if (failure || !text) {
        console.error("AI troubleshoot failed", failure);
        const status = (failure as { statusCode?: number } | null)?.statusCode;
        if (status === 429) return { ok: false as const, error: "Слишком много запросов, попробуйте через минуту" };
        if (status === 402) return { ok: false as const, error: "Закончились AI-кредиты, пополните баланс в настройках" };
        return { ok: false as const, error: "AI-помощник сейчас не ответил, попробуйте ещё раз" };
      }
      return { ok: true as const, plan: text, linkLevel: link?.level ?? null };
    } catch (e) {
      console.error("AI troubleshoot error", e);
      return { ok: false as const, error: "AI-помощник сейчас не ответил, попробуйте ещё раз" };
    }
  });
