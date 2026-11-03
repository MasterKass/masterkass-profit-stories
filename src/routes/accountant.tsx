import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CalendarClock, Check, Download, FileText, Keyboard, Mic, Paperclip, Plus, Receipt, Send, ShieldCheck, X } from "lucide-react";
import { BackHome } from "@/components/back-home";

export const Route = createFileRoute("/accountant")({
  head: () => ({
    meta: [
      { title: "Кабинет бухгалтера · Мастер Касс" },
      { name: "description", content: "Кабинет бухгалтера: график оплат кассовых сервисов, сроки ФН и подписей, документы от Мастер Касс, сверка смен и ИИ-помощник по 54-ФЗ." },
      { property: "og:title", content: "Кабинет бухгалтера · Мастер Касс" },
      { property: "og:description", content: "Платежи, документы и сверка кассы в одном окне." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Accountant,
});

const PAYMENTS = [
  { date: "5 ноя", what: "ОФД, точка №1", sum: "3 000 ₽", soon: true },
  { date: "8 ноя", what: "Приложения Эвотор", sum: "1 490 ₽", soon: true },
  { date: "15 ноя", what: "Тариф «Учёт», Мастер Касс", sum: "3 850 ₽" },
  { date: "20 ноя", what: "Маркировка, Честный Знак", sum: "1 200 ₽" },
];

const DEADLINES = [
  { what: "Фискальный накопитель, точка №1", left: "24 дня", warn: true },
  { what: "Фискальный накопитель, точка №2", left: "211 дней" },
  { what: "Электронная подпись директора", left: "47 дней" },
];

const DOCS = [
  { name: "Счёт № 1184 на тариф «Учёт», ноябрь", status: "К оплате" },
  { name: "УПД № 1027 за октябрь", status: "В ЭДО, ждёт подписи" },
  { name: "Акт сверки за 3 квартал", status: "Подписан" },
  { name: "Счёт № 1102 на фискальный накопитель", status: "Оплачен" },
];

const SHIFTS = [
  { day: "2 ноя", cash: "18 420", card: "41 300", sbp: "6 150", ok: true },
  { day: "1 ноя", cash: "21 080", card: "39 760", sbp: "5 420", ok: true },
  { day: "31 окт", cash: "16 900", card: "44 210", sbp: "7 030", ok: false },
];

function Accountant() {
  const [q, setQ] = useState("");
  const [voice, setVoice] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [asked, setAsked] = useState<string | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const wantFocus = useRef(false);

  useEffect(() => {
    if (!voice && wantFocus.current) { wantFocus.current = false; field.current?.focus(); }
  }, [voice]);

  return (
    <main className="mk-page mk-cab min-h-screen">
      <BackHome />
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-24">
        <header className="mk-cab-head">
          <div>
            <p className="mk-cab-org">Кофейня «Утро»</p>
            <p className="mk-cab-muted">Марина С. · бухгалтер · 2 точки</p>
          </div>
          <span className="mk-csh-status"><Check size={14} aria-hidden="true" />Все чеки переданы в налоговую</span>
        </header>

        <section className="mk-card mk-csh-ai" aria-label="Вопрос ИИ-помощнику">
          <form className="mk-csh-box" onSubmit={(e) => { e.preventDefault(); if (q.trim() || files.length) { setAsked(q.trim() || `Файл: ${files[0]?.name ?? ""}`); setQ(""); setFiles([]); } }}>
            {voice ? (
              <div className="mk-csh-voice">
                <span className="mk-wave flex h-5 items-center gap-1" aria-hidden="true">
                  {Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ animationDelay: `${i * 70}ms` }} />)}
                </span>
                <span>Голосовой режим скоро заработает</span>
              </div>
            ) : (
              <textarea ref={field} value={q} onChange={(e) => setQ(e.target.value)} rows={2} placeholder="Например: как пробить чек коррекции за вчера?" aria-label="Вопрос ИИ-помощнику"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} />
            )}
            {files.length > 0 && (
              <ul className="mk-csh-files">
                {files.map((f, i) => (
                  <li key={f.name + i}><Paperclip size={13} aria-hidden="true" /><span>{f.name}</span>
                    <button type="button" aria-label={`Убрать ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}><X size={13} aria-hidden="true" /></button></li>
                ))}
              </ul>
            )}
            <div className="mk-csh-bar">
              <label className="mk-csh-ibtn" aria-label="Прикрепить файл">
                <Plus size={22} aria-hidden="true" />
                <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="sr-only" onChange={(e) => { setFiles([...files, ...Array.from(e.target.files ?? [])]); e.target.value = ""; }} />
              </label>
              <span className="flex-1" />
              <button type="button" onClick={() => { wantFocus.current = true; setVoice(false); }} aria-label="Ввести текстом" className={`mk-csh-ibtn ${voice ? "opacity-50" : ""}`}><Keyboard size={20} aria-hidden="true" /></button>
              <button type="button" onClick={() => setVoice(true)} aria-label="Спросить голосом" className={`mk-csh-ibtn ${voice ? "" : "opacity-60"}`}><Mic size={22} aria-hidden="true" /></button>
              {(q.trim().length > 0 || files.length > 0) && (
                <button type="submit" className="mk-csh-ibtn mk-csh-send" aria-label="Отправить"><Send size={18} aria-hidden="true" /></button>
              )}
            </div>
          </form>
          {asked && (
            <div className="mk-csh-answer" role="status">
              <p className="mk-csh-asked">{asked}</p>
              <p className="mk-cab-muted">В демо-режиме ИИ пока не отвечает. Живые ответы по 54-ФЗ подключим после запуска.</p>
            </div>
          )}
        </section>

        <section className="mk-card mk-acc-block" aria-label="График оплат">
          <p className="mk-cab-kicker"><CalendarClock size={14} aria-hidden="true" />График оплат кассовых сервисов</p>
          <ul className="mk-acc-list">
            {PAYMENTS.map((p) => (
              <li key={p.what}>
                <span className="mk-acc-date" data-soon={p.soon}>{p.date}</span>
                <span className="mk-acc-name">{p.what}</span>
                <b>{p.sum}</b>
              </li>
            ))}
          </ul>
          <p className="mk-cab-muted mt-3">Итого в ноябре: 9 540 ₽</p>
        </section>

        <section className="mk-card mk-acc-block" aria-label="Сроки">
          <p className="mk-cab-kicker"><ShieldCheck size={14} aria-hidden="true" />Сроки накопителей и подписей</p>
          <ul className="mk-acc-list">
            {DEADLINES.map((d) => (
              <li key={d.what}>
                <span className="mk-acc-name">{d.what}</span>
                <b className="mk-acc-date" data-soon={d.warn}>{d.left}</b>
              </li>
            ))}
          </ul>
        </section>

        <section className="mk-card mk-acc-block" aria-label="Документы">
          <p className="mk-cab-kicker"><FileText size={14} aria-hidden="true" />Документы от Мастер Касс</p>
          <ul className="mk-acc-list">
            {DOCS.map((d) => (
              <li key={d.name}>
                <span className="mk-acc-name">{d.name}<small>{d.status}</small></span>
                <button type="button" className="mk-csh-ibtn" aria-label={`Скачать: ${d.name}`} onClick={() => alert("Скачивание заработает после запуска")}><Download size={18} aria-hidden="true" /></button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mk-card mk-acc-block" aria-label="Сверка смен">
          <p className="mk-cab-kicker"><Receipt size={14} aria-hidden="true" />Сверка смен, ₽</p>
          <div className="overflow-x-auto">
            <table className="mk-acc-table">
              <thead><tr><th>День</th><th>Наличные</th><th>Карта</th><th>СБП</th><th>ОФД</th></tr></thead>
              <tbody>
                {SHIFTS.map((s) => (
                  <tr key={s.day}><td>{s.day}</td><td>{s.cash}</td><td>{s.card}</td><td>{s.sbp}</td>
                    <td>{s.ok ? <Check size={16} aria-label="Передано" /> : <span className="mk-acc-date" data-soon="true">1 возврат</span>}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
