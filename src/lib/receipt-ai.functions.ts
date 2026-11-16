import { createServerFn } from "@tanstack/react-start";
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";
import { parseDiagnosis, validateInput, type AnalyzeInput, type Diagnosis } from "./receipt-ai";

const SYSTEM = `Ты — опытный инженер сервисного центра контрольно-кассовой техники в России (54-ФЗ, ФФД 1.05/1.2, Эвотор, ОФД, ФНС).
Мастер присылает код отказа, текст квитанции ФНС/ОФД или снимок экрана. Объясни простым русским языком причину и дай пошаговое решение.
Практика сервиса: при перерегистрации статусы бинарные — «Перерегистрировано» или «Отказ». Частые причины отказа: адрес установки не совпадает с ФИАС/ГАР (исправить адрес в кабинете ФНС с КЭП клиента); ошибки ФД/ФПД при ручном вводе. Неверный РН встречается редко.
Карантин чеков: маркировка (тег 2106), признаки регистрации (тег 1207, подакциз), время, ставка НДС.
При отказе у кассы 30 дней до снятия с учёта — подчеркни срочность. Не выдумывай коды; если данных мало — скажи, что уточнить.
Ответ строго JSON по схеме.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "cause", "source", "severity", "steps", "needVisit", "needSignature", "clientMessage", "taskTitle"],
  properties: {
    title: { type: "string" },
    cause: { type: "string" },
    source: { type: "string", description: "Кто вернул ошибку: ФНС, ОФД, касса, ФН" },
    severity: { type: "string", enum: ["low", "medium", "high"] },
    steps: { type: "array", items: { type: "string" } },
    needVisit: { type: "boolean" },
    needSignature: { type: "boolean", description: "Нужна КЭП клиента" },
    clientMessage: { type: "string", description: "Короткое сообщение клиенту" },
    taskTitle: { type: "string", description: "Заголовок задачи в Битрикс24" },
  },
} as const;

export const analyzeRefusal = createServerFn({ method: "POST" })
  .inputValidator((d: AnalyzeInput) => d)
  .handler(async ({ data }): Promise<{ ok: true; diagnosis: Diagnosis } | { ok: false; error: string }> => {
    const bad = validateInput(data);
    if (bad) return { ok: false, error: bad };
    const parts = [
      data.context ? `Касса: ${data.context.slice(0, 500)}` : "",
      data.code.trim() ? `Код/формулировка отказа: ${data.code.trim()}` : "",
      data.text.trim() ? `Текст квитанции:\n${data.text.trim()}` : "",
    ].filter(Boolean).join("\n\n") || "Разбери квитанцию на снимке.";
    const content: Array<{ type: "input_text"; text: string } | { type: "input_image"; image_url: string; detail: "auto" }> = [
      { type: "input_text", text: parts },
    ];
    if (data.image) content.push({ type: "input_image", image_url: data.image, detail: "auto" });
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: SYSTEM,
        input: [{ role: "user", content }],
        text: { format: { type: "json_schema", name: "diagnosis", strict: true, schema: SCHEMA } },
      });
      let out = "";
      for (const item of res.output ?? []) {
        if (item.type === "message") for (const c of item.content) if (c.type === "output_text") out += c.text;
      }
      const d = parseDiagnosis(out);
      return d ? { ok: true, diagnosis: d } : { ok: false, error: "Не удалось разобрать ответ помощника. Попробуйте уточнить описание." };
    } catch (e) {
      console.error("analyzeRefusal", e);
      if (e instanceof GatewayError && e.httpStatus === 402) return { ok: false, error: "Закончились средства на AI. Пополните баланс." };
      if (e instanceof GatewayError && e.httpStatus === 429) return { ok: false, error: "Слишком много запросов, подождите минуту." };
      return { ok: false, error: "Помощник сейчас недоступен. Попробуйте позже." };
    }
  });
