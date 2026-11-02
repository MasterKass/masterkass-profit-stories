import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, ShieldCheck } from "lucide-react";
import { BackHome } from "@/components/back-home";
import {
  CODE_LENGTH,
  DEMO_ACCOUNTS,
  DEMO_CODE,
  RESEND_SECONDS,
  ROLE_ACCESS,
  ROLE_LABELS,
  formatPhone,
  normalizePhone,
  verifyCode,
  type Role,
} from "@/lib/login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Вход в кабинет · Мастер Касс" },
      { name: "description", content: "Вход в личный кабинет Мастер Касс по номеру телефона и коду из SMS, без паролей." },
      { property: "og:title", content: "Вход в кабинет · Мастер Касс" },
      { property: "og:description", content: "Вход по номеру телефона и SMS-коду. Доступ по ролям: директор, кассир, бухгалтер." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [step, setStep] = useState<"phone" | "code" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [codeError, setCodeError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [role, setRole] = useState<Role | null>(null);
  const cells = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useEffect(() => {
    if (step === "code") cells.current[0]?.focus();
  }, [step]);

  const sendCode = (raw = phone) => {
    const n = normalizePhone(raw);
    if (!n) {
      setPhoneError("Нужен номер из 10 цифр: например, +7 904 123-45-67");
      return;
    }
    setPhoneError("");
    setPhone(formatPhone(n));
    setDigits(Array(CODE_LENGTH).fill(""));
    setCodeError("");
    setSeconds(RESEND_SECONDS);
    setStep("code");
  };

  const check = (code: string) => {
    const n = normalizePhone(phone);
    if (!n) return;
    const r = verifyCode(n, code);
    if (r.ok) {
      setRole(r.role);
      setStep("done");
    } else {
      setCodeError(r.error);
    }
  };

  const setDigit = (i: number, value: string) => {
    const v = value.replace(/\D/g, "");
    const next = [...digits];
    if (v.length > 1) {
      v.slice(0, CODE_LENGTH).split("").forEach((c, k) => { if (i + k < CODE_LENGTH) next[i + k] = c; });
    } else {
      next[i] = v;
    }
    setDigits(next);
    setCodeError("");
    const filled = next.findIndex((c) => !c);
    if (filled === -1) check(next.join(""));
    else if (v) cells.current[Math.min(filled, CODE_LENGTH - 1)]?.focus();
  };

  return (
    <div className="mk-page min-h-screen">
      <BackHome />
      <main className="mk-login-wrap">
        <section className="mk-login-card" aria-labelledby="login-title">
          <span className="mk-login-kicker"><ShieldCheck aria-hidden="true" />Личный кабинет</span>

          {step === "phone" && (
            <>
              <h1 id="login-title" className="mk-login-title">Вход по номеру телефона</h1>
              <p className="mk-login-note">Пришлём код из 4 цифр. Пароли не нужны: доступ привязан к вашему номеру.</p>
              <form className="mk-login-form" onSubmit={(e) => { e.preventDefault(); sendCode(); }} noValidate>
                <label className="mk-login-field">
                  <span>Телефон</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+7 904 123-45-67"
                    value={phone}
                    onChange={(e) => { setPhone(formatPhone(e.target.value)); setPhoneError(""); }}
                    aria-invalid={phoneError ? true : undefined}
                  />
                  {phoneError && <em role="alert">{phoneError}</em>}
                </label>
                <button type="submit" className="mk-login-btn">Получить код<ArrowUpRight aria-hidden="true" /></button>
              </form>
            </>
          )}

          {step === "code" && (
            <>
              <h1 id="login-title" className="mk-login-title">Введите код из SMS</h1>
              <p className="mk-login-note">Отправили на {phone}.</p>
              <div className="mk-login-code" role="group" aria-label="Код из SMS">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { cells.current[i] = el; }}
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    aria-label={`Цифра ${i + 1}`}
                    value={d}
                    aria-invalid={codeError ? true : undefined}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) cells.current[i - 1]?.focus(); }}
                  />
                ))}
              </div>
              {codeError && <p className="mk-login-error" role="alert">{codeError}</p>}
              <div className="mk-login-links">
                {seconds > 0 ? (
                  <span>Отправить код повторно через {seconds} с</span>
                ) : (
                  <button type="button" onClick={() => sendCode()}>Отправить код повторно</button>
                )}
                <button type="button" onClick={() => setStep("phone")}>Изменить номер</button>
              </div>
            </>
          )}

          {step === "done" && role && (
            <div role="status">
              <span className="mk-login-ok" aria-hidden="true"><Check /></span>
              <h1 id="login-title" className="mk-login-title">Вход выполнен</h1>
              <p className="mk-login-note">Роль: <b>{ROLE_LABELS[role]}</b>. Кабинет сейчас в разработке, в нём будет:</p>
              <ul className="mk-login-access">
                {ROLE_ACCESS[role].map((a) => <li key={a}>{a}</li>)}
              </ul>
              <button type="button" className="mk-login-btn mk-login-btn-ghost" onClick={() => { setStep("phone"); setRole(null); setPhone(""); }}>Выйти</button>
            </div>
          )}
        </section>

        {step !== "done" && (
          <aside className="mk-login-demo" aria-label="Демонстрационный вход">
            <p className="mk-login-demo-title">Демонстрационный режим</p>
            <p className="mk-login-demo-note">Настоящие SMS подключим позже. Выберите роль, код: {DEMO_CODE}.</p>
            <div className="mk-login-demo-grid">
              {DEMO_ACCOUNTS.map((a) => (
                <button key={a.phone} type="button" onClick={() => sendCode(a.phone)}>
                  <b>{ROLE_LABELS[a.role]}</b>
                  <span>{formatPhone(a.phone)}</span>
                </button>
              ))}
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
