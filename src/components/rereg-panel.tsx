import { useState } from "react";
import { Copy, MapPin, ShieldCheck, ShieldAlert } from "lucide-react";
import { regState, addressRisk, rescueLines, WATCH_HOURS, type RegCheck, type RescueData, type FiasResult } from "@/lib/fns-reg";

export type RegCase = { replacedAt: Date; checks: RegCheck[]; rescue: RescueData; fias: FiasResult };

function fmt(d: Date) { return d.toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }); }

export function ReregPanel({ c, now }: { c: RegCase | undefined; now: Date }) {
  const [copied, setCopied] = useState("");
  if (!c) return (
    <section className="mk-card mk-acc-block" aria-label="Перерегистрация">
      <p className="mk-cab-kicker"><ShieldCheck size={14} aria-hidden="true" />Перерегистрация и налоговая</p>
      <p className="mk-cab-muted">Замен ФН за последние 30 дней не было.</p>
    </section>
  );
  const s = regState(c.replacedAt, c.checks, now);
  const risk = addressRisk(c.fias);
  const copy = (k: string, v: string) => { void navigator.clipboard?.writeText(v); setCopied(k); setTimeout(() => setCopied(""), 1500); };
  const last = c.checks[c.checks.length - 1];
  return (
    <section className="mk-card mk-acc-block" aria-label="Перерегистрация">
      <p className="mk-cab-kicker"><ShieldCheck size={14} aria-hidden="true" />Перерегистрация и налоговая</p>
      <p className="mk-cab-muted">ФН заменён {fmt(c.replacedAt)}</p>
      <div className="mk-eng-tile" data-tone={risk === "ok" ? "ok" : "warn"}>
        <small><MapPin size={12} className="inline" aria-hidden="true" /> Адрес в ФИАС</small>
        <b>{risk === "ok" ? "Найден, дом с номером" : "Не найден точно"}</b>
        <span>{risk === "ok" ? "автоперерегистрация пройдёт" : "вероятен отказ: готовьте подачу через ЛК ФНС с ЭЦП"}</span>
      </div>
      {s.kind === "watch" && (
        <div className="mk-eng-tile" data-tone="ok">
          <small>Перерегистрировано · на контроле {WATCH_HOURS} ч</small>
          <b>Прошло {s.hoursPassed} из {WATCH_HOURS} ч</b>
          <span>{last ? `последняя проверка ${fmt(last.at)} — отказов нет` : "ждём первую квитанцию"}</span>
          <div className="mk-rr-bar"><i style={{ width: `${(s.hoursPassed / WATCH_HOURS) * 100}%` }} /></div>
        </div>
      )}
      {s.kind === "confirmed" && (
        <div className="mk-eng-tile" data-tone="ok"><small>Итог</small><b>Подтверждено налоговой</b><span>48 часов без отказа, касса снята с контроля</span></div>
      )}
      {s.kind === "deregistered" && (
        <div className="mk-eng-tile" data-tone="bad"><small>Итог</small><b>Срок 30 дней истёк</b><span>касса снята с учёта, нужна новая регистрация</span></div>
      )}
      {s.kind === "refused" && (
        <>
          <div className="mk-eng-tile" data-tone="bad">
            <small><ShieldAlert size={12} className="inline" aria-hidden="true" /> Отказ ФНС · {fmt(s.refusedAt)}</small>
            <b>Осталось {s.daysLeft} дн. на ручную подачу</b>
            <span>Причина: {s.reason}. Задача в Битрикс24 со сроком до {s.taskDue.toLocaleDateString("ru-RU")}</span>
          </div>
          <p className="mk-cab-muted">Данные для личного кабинета ФНС:</p>
          <ul className="mk-acc-list">
            {rescueLines(c.rescue).map(([a, b]) => (
              <li key={a}><span className="mk-acc-name">{a}<small>{b}</small></span>
                <button type="button" className="mk-acc-date" onClick={() => copy(a, b)} aria-label={`Копировать: ${a}`}>
                  {copied === a ? "Скопировано" : <Copy size={14} aria-hidden="true" />}
                </button></li>
            ))}
          </ul>
          <a className="mk-eng-call" href="https://lkul.nalog.ru" target="_blank" rel="noreferrer">Открыть ЛК ФНС юрлица</a>
        </>
      )}
      <p className="mk-cab-muted" style={{ fontSize: 12 }}>Демо: квитанции будут приходить от ОФД после подключения интеграции.</p>
    </section>
  );
}
