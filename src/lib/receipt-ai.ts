// Чистые правила разбора отказов: проверка ввода и ответа модели, без сети.
export const MAX_TEXT = 6000;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type Severity = "low" | "medium" | "high";
export type Diagnosis = {
  title: string;
  cause: string;
  source: string;
  severity: Severity;
  steps: string[];
  needVisit: boolean;
  needSignature: boolean;
  clientMessage: string;
  taskTitle: string;
};

export type AnalyzeInput = { code: string; text: string; image?: string; context?: string };

export function validateInput(i: AnalyzeInput): string | null {
  const code = i.code.trim(), text = i.text.trim();
  if (!code && !text && !i.image) return "Введите код отказа, текст квитанции или загрузите снимок.";
  if (code.length > 200) return "Код отказа слишком длинный.";
  if (text.length > MAX_TEXT) return `Текст длиннее ${MAX_TEXT} знаков — сократите.`;
  if (i.image) {
    if (!/^data:image\/(png|jpe?g|webp);base64,/.test(i.image)) return "Поддерживаются снимки PNG, JPG или WEBP.";
    if (Math.floor((i.image.length * 3) / 4) > MAX_IMAGE_BYTES * 1.4) return "Снимок больше 4 МБ.";
  }
  return null;
}

export function parseDiagnosis(raw: string): Diagnosis | null {
  try {
    const o = JSON.parse(raw) as Partial<Diagnosis>;
    if (typeof o.cause !== "string" || !Array.isArray(o.steps) || o.steps.length === 0) return null;
    const sev: Severity = o.severity === "high" || o.severity === "low" ? o.severity : "medium";
    return {
      title: String(o.title ?? "Разбор отказа"),
      cause: o.cause,
      source: String(o.source ?? "не определён"),
      severity: sev,
      steps: o.steps.map(String).slice(0, 12),
      needVisit: Boolean(o.needVisit),
      needSignature: Boolean(o.needSignature),
      clientMessage: String(o.clientMessage ?? ""),
      taskTitle: String(o.taskTitle ?? ""),
    };
  } catch {
    return null;
  }
}
