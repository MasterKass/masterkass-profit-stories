import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ArrowUpRight } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { validatePartnerLead, type PartnerLeadErrors } from "@/lib/partner-lead";
import { submitPartnerLead } from "@/lib/partner-lead.functions";

/** Форма лида на партнёрку: имя и почта, куда прислать полное описание программы. */
export function PartnerLeadForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<PartnerLeadErrors>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const submit = useServerFn(submitPartnerLead);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validatePartnerLead({ name, email });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setFailed(false);
    setSending(true);
    try {
      const res = await submit({ data: { name, email, company: honeypot } });
      if (res.ok) setSent(true);
      else setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mk-lead mk-partner-lead" id="partner-guide" aria-labelledby="partner-guide-title">
      <div className="mk-lead-grid">
        <header className="max-w-md">
          <h2 id="partner-guide-title" className="mk-lead-title">Полное описание программы</h2>
          <p className="mk-lead-note">
            Пришлём на почту подробное описание партнёрской программы: условия, выплаты, договор и ответы на частые вопросы.
          </p>
        </header>

        {sent ? (
          <div className="mk-lead-done" role="status">
            <span className="mk-lead-done-icon" aria-hidden="true"><Check className="h-5 w-5" /></span>
            <div>
              <p className="mk-lead-done-title">Письмо уже в пути</p>
              <p className="mk-lead-done-text">
                Спасибо! Отправим полное описание программы на указанную почту в ближайшее рабочее время.
              </p>
            </div>
          </div>
        ) : (
          <form className="mk-lead-form" onSubmit={onSubmit} noValidate>
            <label className="mk-field">
              <span className="mk-field-label">Имя</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Как к вам обращаться"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "partner-name-error" : undefined}
              />
              {errors.name && <span className="mk-field-error" id="partner-name-error" role="alert">{errors.name}</span>}
            </label>

            <label className="mk-field">
              <span className="mk-field-label">Почта</span>
              <input
                type="email"
                name="email"
                inputMode="email"
                autoComplete="email"
                placeholder="partner@company.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "partner-email-error" : undefined}
              />
              {errors.email && <span className="mk-field-error" id="partner-email-error" role="alert">{errors.email}</span>}
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
                {sending ? "Отправляем…" : "Получить описание на почту"}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
              {failed && (
                <span className="mk-field-error" role="alert">
                  Не получилось отправить. Попробуйте ещё раз через минуту.
                </span>
              )}
              <p className="mk-lead-privacy">
                Отправляя форму, соглашаетесь на обработку персональных данных согласно{" "}
                <Link to="/privacy">Политике обработки персональных данных</Link>.
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
