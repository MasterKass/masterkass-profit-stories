import { useEffect, useState } from "react";
import { PrivacyLink } from "@/components/privacy-dialog";
import { Check, ArrowUpRight } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { TRIAL_KEY } from "@/lib/onboarding";
import { validateRequest, type RequestErrors } from "@/lib/request";
import { submitServiceRequest } from "@/lib/request.functions";

/** Тёмная плашка заявки на сервис: только телефон и почта. */
export function RequestForm() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<RequestErrors>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const submit = useServerFn(submitServiceRequest);
  const navigate = useNavigate();

  // Кружок возврата со страницы политики ведёт сюда. Страница ещё догружается
  // (кадры комикса, печатающийся текст помощника) и плашка «уезжает» вниз,
  // поэтому подстраиваемся, пока высота страницы меняется.
  useEffect(() => {
    if (window.location.hash !== "#request") return;
    const node = document.getElementById("request");
    if (!node) return;

    const OFFSET = 90;
    node.scrollIntoView({ block: "start" });

    let lastHeight = document.documentElement.scrollHeight;
    let tries = 0;
    const timer = window.setInterval(() => {
      const height = document.documentElement.scrollHeight;
      if (++tries > 12 || height === lastHeight) return window.clearInterval(timer);
      lastHeight = height;
      if (Math.abs(node.getBoundingClientRect().top - OFFSET) > 8) node.scrollIntoView({ block: "start" });
    }, 150);

    return () => window.clearInterval(timer);
  }, []);



  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateRequest({ phone, email });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setFailed(false);
    setSending(true);
    try {
      const res = await submit({ data: { phone, email, company: honeypot, source: "Присоединиться к сервису" } });
      if (res.ok) {
        sessionStorage.setItem(TRIAL_KEY, JSON.stringify({ dealId: res.dealId, email: result.value.email }));
        setSent(true);
        navigate({ to: "/onboarding", search: { tariff: undefined, ref: undefined } });
      }
      else setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mk-lead" id="request" aria-labelledby="request-title">
      <div className="mk-lead-grid">
        <header className="max-w-md">
          <h2 id="request-title" className="mk-lead-title">Начните бесплатный период МастерКасс</h2>
          <p className="mk-lead-note">Закрепим личный кабинет за вашим номером и поможем настроить кассу. Карта не нужна.</p>
        </header>

        {sent ? (
          <div className="mk-lead-done" role="status">
            <span className="mk-lead-done-icon" aria-hidden="true"><Check className="h-5 w-5" /></span>
            <div>
              <p className="mk-lead-done-title">Контакты сохранены</p>
              <p className="mk-lead-done-text">
                Переходим к выбору тарифа…
              </p>
            </div>
          </div>
        ) : (
          <form className="mk-lead-form" onSubmit={onSubmit} noValidate>
            <label className="mk-field">
              <span className="mk-field-label">Телефон</span>
              <input
                type="tel"
                name="phone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+7 904 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errors.phone ? "request-phone-error" : undefined}
              />
              {errors.phone && <span className="mk-field-error" id="request-phone-error" role="alert">{errors.phone}</span>}
            </label>

            <label className="mk-field">
              <span className="mk-field-label">Почта</span>
              <input
                type="email"
                name="email"
                inputMode="email"
                autoComplete="email"
                placeholder="kassa@shop.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "request-email-error" : undefined}
              />
              {errors.email && <span className="mk-field-error" id="request-email-error" role="alert">{errors.email}</span>}
            </label>

            <input
              className="mk-lead-hp"
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />

            <div className="mk-lead-actions">
              <button type="submit" className="mk-lead-btn" disabled={sending}>
                {sending ? "Сохраняем…" : "Далее: выбрать тариф"}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
              {failed && (
                <span className="mk-field-error" role="alert">
                  Не получилось сохранить контакты. Попробуйте ещё раз через минуту.
                </span>
              )}
              <p className="mk-lead-privacy">
                Продолжая, соглашаетесь на обработку персональных данных согласно{" "}
                <PrivacyLink />.
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
