import { ShieldAlert, ShieldCheck, Phone } from "lucide-react";
import { QUARANTINE_INFO, quarantineSummary, quarantineTaskTitle, type QuarantineCheck } from "@/lib/quarantine";

export function QuarantinePanel({ checks, serial, client, now }: { checks: QuarantineCheck[]; serial: string; client: string; now: Date }) {
  const s = quarantineSummary(checks, now);
  return (
    <section className="mk-card mk-acc-block" aria-label="Карантин чеков">
      <p className="mk-cab-kicker">{s.count ? <ShieldAlert size={14} aria-hidden="true" /> : <ShieldCheck size={14} aria-hidden="true" />}Чеки и карантин налоговой</p>
      {s.count === 0 ? (
        <p className="mk-cab-muted">Карантина нет. Все чеки за 7 дней приняты налоговой без замечаний.</p>
      ) : (
        <>
          <p className="mk-eng-diag-none">В карантине {s.count} {s.count === 1 ? "чек" : s.count < 5 ? "чека" : "чеков"} за 7 дней{s.needCall ? " — позвоните клиенту" : ""}.</p>
          {s.reasons.map((r) => (
            <div key={r} className="mk-eng-tile" data-tone={QUARANTINE_INFO[r].call ? "bad" : "warn"}>
              <b>{QUARANTINE_INFO[r].title}</b>
              <span>Что сделать: {QUARANTINE_INFO[r].fix}</span>
            </div>
          ))}
          <ul className="mk-acc-list">
            {s.checks.map((c) => (
              <li key={c.doc}><span className="mk-acc-name">Чек №{c.doc} · {c.sum.toLocaleString("ru-RU")} ₽<small>{QUARANTINE_INFO[c.reason].title.split(":")[0]}</small></span>
                <b className="mk-acc-date" data-soon="true">{c.at.toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</b></li>
            ))}
          </ul>
          <p className="mk-cab-muted" style={{ fontSize: 12 }}><Phone size={12} className="inline" aria-hidden="true" /> Задача для Битрикс24: «{quarantineTaskTitle(serial, client, s.reasons)}»</p>
        </>
      )}
      <p className="mk-cab-muted" style={{ fontSize: 12 }}>Демо: настоящие квитанции налоговой придут после подключения «Платформы ОФД».</p>
    </section>
  );
}
