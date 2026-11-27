import { useState } from "react";
import { PrivacyLink } from "@/components/privacy-dialog";
import { Check, ArrowUpRight } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { validateInstallRequest, type InstallRequestErrors } from "@/lib/install-request";
import { submitInstallRequest } from "@/lib/install-request.functions";

/** Окно заявки на установку кассы на странице «Кассы и оборудование». */
export function InstallRequestForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [comment, setComment] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<InstallRequestErrors>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const submit = useServerFn(submitInstallRequest);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateInstallRequest({ name, phone, business, comment });
    if (!result.ok) { setErrors(result.errors); return; }
    setErrors({}); setFailed(false); setSending(true);
    try {
      const res = await submit({ data: { name, phone, business, comment, company: honeypot } });
      if (res.ok) setSent(true); else setFailed(true);
    } catch { setFailed(true); } finally { setSending(false); }
  };

  const field = (id: keyof InstallRequestErrors, label: string, input: React.ReactNode) => (
    <label className="mk-field">
      <span className="mk-field-label">{label}</span>
      {input}
      {errors[id] && <span className="mk-field-error" id={`install-${id}-error`} role="alert">{errors[id]}</span>}
    </label>
  );

  return (
    <section className="mk-lead mt-16" id="install-request" aria-labelledby="install-request-title">
      <div className="mk-lead-grid">
        <header className="max-w-md">
          <h2 id="install-request-title" className="mk-lead-title">Заявка на установку кассы</h2>
          <p className="mk-lead-note">
            Оставьте контакты и пару слов о точке — подберём кассу и оборудование и рассчитаем установку под ключ.
          </p>
        </header>
        {sent ? (
          <div className="mk-lead-done" role="status">
            <span className="mk-lead-done-icon" aria-hidden="true"><Check className="h-5 w-5" /></span>
            <div>
              <p className="mk-lead-done-title">Заявка отправлена</p>
              <p className="mk-lead-done-text">С вами свяжется специалист для детального расчёта проекта.</p>
            </div>
          </div>
        ) : (
          <form className="mk-lead-form" onSubmit={onSubmit} noValidate>
            {field("name", "Имя", <input type="text" name="name" autoComplete="name" placeholder="Как к вам обращаться" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={errors.name ? true : undefined} />)}
            {field("phone", "Телефон", <input type="tel" name="phone" inputMode="tel" autoComplete="tel" placeholder="+7 900 000-00-00" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={errors.phone ? true : undefined} />)}
            {field("business", "Бизнес и город", <input type="text" name="business" placeholder="Например: кофейня, Ростов-на-Дону" value={business} onChange={(e) => setBusiness(e.target.value)} />)}
            {field("comment", "Комментарий", <input type="text" name="comment" placeholder="Сколько касс, что уже есть на точке" value={comment} onChange={(e) => setComment(e.target.value)} />)}
            <input className="mk-lead-hp" type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            <div className="mk-lead-actions">
              <button type="submit" className="mk-lead-btn" disabled={sending}>
                {sending ? "Отправляем…" : "Отправить заявку"}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
              {failed && <span className="mk-field-error" role="alert">Не получилось отправить. Попробуйте ещё раз через минуту.</span>}
              <p className="mk-lead-privacy">
                Отправляя форму, соглашаетесь на обработку персональных данных согласно <PrivacyLink />.
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
