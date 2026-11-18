/** Серверная часть входа по SMS: отправка кода через SMS.ru и подписанный токен без базы данных. */
const enc = new TextEncoder();

async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const CODE_TTL_MS = 5 * 60 * 1000;

export async function signCode(secret: string, phone: string, code: string, exp: number) {
  return `${exp}.${await hmac(secret, `${phone}|${code}|${exp}`)}`;
}

export async function checkCode(secret: string, phone: string, code: string, token: string, now = Date.now()) {
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || exp < now) return "expired" as const;
  const expected = await hmac(secret, `${phone}|${code}|${exp}`);
  return expected === sig ? ("ok" as const) : ("wrong" as const);
}

export function randomCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0]! % 10000;
  return n.toString().padStart(4, "0");
}

export async function sendSms(apiId: string, phone: string, text: string): Promise<boolean> {
  const url = new URL("https://sms.ru/sms/send");
  url.searchParams.set("api_id", apiId);
  url.searchParams.set("to", phone.replace(/\D/g, ""));
  url.searchParams.set("msg", text);
  url.searchParams.set("json", "1");
  const r = await fetch(url, { method: "GET" });
  if (!r.ok) return false;
  const j = (await r.json()) as { status?: string; sms?: Record<string, { status?: string; status_text?: string }> };
  const s = j.sms ? Object.values(j.sms)[0] : undefined;
  if (j.status !== "OK" || s?.status !== "OK") {
    console.error("SMS.ru отказ:", s?.status_text ?? j.status);
    return false;
  }
  return true;
}
