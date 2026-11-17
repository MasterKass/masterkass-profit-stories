import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { validateRequest, type RequestErrors } from "@/lib/request";
import { submitServiceRequest } from "@/lib/request.functions";

/** Подписка на «Пульс»: телефон и почта уходят заявкой с пометкой источника. */
export function PulseSubscribe() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<RequestErrors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const submit = useServerFn(submitServiceRequest);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = validateRequest({ phone, email });
    if (!r.ok) return setErrors(r.errors);
    setErrors({});
    setState("sending");
    try {
      const res = await submit({ data: { phone, email, source: "Подписка на Пульс Гос.регулирования" } });
      setState(res.ok ? "sent" : "failed");
    } catch { setState("failed"); }
  };

  return (
    <section id="subscribe" className="mk-pulse-sub" aria-labelledby="pulse-sub-title">
      <h2 id="pulse-sub-title">Получайте Пульс на почту</h2>
      <p>Раз в месяц — только изменения, которые касаются вашей кассы.</p>
      {state === "sent" ? (
        <p className="mk-pulse-sub-done">Готово. Первый выпуск придёт на {email}.</p>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <label><span className="sr-only">Телефон</span><input type="tel" placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone} /></label>
          <label><span className="sr-only">Почта</span><input type="email" placeholder="Почта" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} /></label>
          <button type="submit" disabled={state === "sending"}>{state === "sending" ? "Отправляем…" : "Получать Пульс"}</button>
          {(errors.phone || errors.email || state === "failed") && <p className="mk-pulse-sub-err">{errors.phone ?? errors.email ?? "Не получилось отправить. Попробуйте ещё раз."}</p>}
        </form>
      )}
    </section>
  );
}
