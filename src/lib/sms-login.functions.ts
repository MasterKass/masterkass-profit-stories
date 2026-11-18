import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DEMO_CODE, normalizePhone, roleForPhone } from "./login";
import { CODE_TTL_MS, checkCode, randomCode, sendSms, signCode } from "./sms-login.server";

const isDemo = (phone: string) => /^\+7900000000\d$/.test(phone);

export const requestLoginCode = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ phone: z.string().max(30) }).parse(d))
  .handler(async ({ data }) => {
    const phone = normalizePhone(data.phone);
    if (!phone) return { ok: false as const, error: "Неверный номер" };
    if (!roleForPhone(phone)) return { ok: false as const, error: "Этот номер пока не подключён к сервису" };
    const secret = process.env["LOGIN_CODE_SECRET"]!;
    const exp = Date.now() + CODE_TTL_MS;
    if (isDemo(phone)) return { ok: true as const, token: await signCode(secret, phone, DEMO_CODE, exp), demo: true };
    const apiId = process.env["SMS_RU_API_ID"];
    if (!apiId) return { ok: false as const, error: "SMS-сервис ещё не подключён" };
    const code = randomCode();
    const sent = await sendSms(apiId, phone, `Код входа в Мастер Касс: ${code}`);
    if (!sent) return { ok: false as const, error: "Не удалось отправить SMS. Попробуйте позже" };
    return { ok: true as const, token: await signCode(secret, phone, code, exp), demo: false };
  });

export const verifyLoginCode = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ phone: z.string().max(30), code: z.string().regex(/^\d{4}$/), token: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const phone = normalizePhone(data.phone);
    const role = phone ? roleForPhone(phone) : null;
    if (!phone || !role) return { ok: false as const, error: "Этот номер пока не подключён к сервису" };
    const r = await checkCode(process.env["LOGIN_CODE_SECRET"]!, phone, data.code, data.token);
    if (r === "expired") return { ok: false as const, error: "Код устарел. Запросите новый" };
    if (r === "wrong") return { ok: false as const, error: "Код не подошёл. Проверьте цифры из SMS" };
    return { ok: true as const, role };
  });
