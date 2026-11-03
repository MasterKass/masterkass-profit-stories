import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, ClipboardCheck, Keyboard, Mic, Package, Paperclip, Plus, Send, Truck, Users, X } from "lucide-react";
import { BackHome } from "@/components/back-home";

export const Route = createFileRoute("/administrator")({
  head: () => ({
    meta: [
      { title: "Кабинет администратора · Мастер Касс" },
      { name: "description", content: "Кабинет администратора точки: смены и сотрудники, приёмка накладных, остатки, инвентаризация и чек-листы с ИИ-помощником." },
      { property: "og:title", content: "Кабинет администратора · Мастер Касс" },
      { property: "og:description", content: "Смены, товароучёт и порядок на точке в одном окне." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Administrator,
});

const STAFF = [
  { name: "Алина К.", role: "Бариста, точка №1", status: "На смене с 07:55" },
  { name: "Игорь П.", role: "Кассир, точка №2", status: "Опоздание 12 мин", warn: true },
  { name: "Даша М.", role: "Бариста, точка №2", status: "Смена с 14:00" },
];

const INVOICES = [
  { name: "Накладная № 452, молочная продукция", status: "Ждёт приёмки", warn: true },
  { name: "Накладная № 449, кофе в зёрнах", status: "Расхождение: 2 кг", warn: true },
  { name: "Накладная № 447, выпечка", status: "Оприходована" },
];

const STOCK = [
  { what: "Молоко 3,2%", left: "6 л", warn: true },
  { what: "Стаканы 300 мл", left: "120 шт", warn: true },
  { what: "Сироп карамельный", left: "4 бут." },
];

const CHECKS = [
  { what: "Смена открыта, касса и терминал проверены", ok: true },
  { what: "Размен в кассе на начало дня", ok: true },
  { what: "Вчерашняя смена закрыта, Z-отчёт", ok: true },
  { what: "Инвентаризация точки №1: 10 ноября", ok: false },
];

function Administrator() {
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
            <p className="mk-cab-muted">Ольга Р. · администратор · 2 точки</p>
          </div>
          <span className="mk-csh-status"><Check size={14} aria-hidden="true" />Обе точки открыты</span>
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
              <textarea ref={field} value={q} onChange={(e) => setQ(e.target.value)} rows={2} placeholder="Например: как принять накладную с расхождением?" aria-label="Вопрос ИИ-помощнику"
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
              <p className="mk-cab-muted">В демо-режиме ИИ пока не отвечает. Живые ответы подключим после запуска.</p>
            </div>
          )}
        </section>

        <section className="mk-card mk-acc-block" aria-label="Смены и сотрудники">
          <p className="mk-cab-kicker"><Users size={14} aria-hidden="true" />Смены и сотрудники сегодня</p>
          <ul className="mk-acc-list">
            {STAFF.map((s) => (
              <li key={s.name}>
                <span className="mk-acc-name">{s.name}<small>{s.role}</small></span>
                <b className="mk-acc-date" data-soon={s.warn}>{s.status}</b>
              </li>
            ))}
          </ul>
        </section>

        <section className="mk-card mk-acc-block" aria-label="Приёмка накладных">
          <p className="mk-cab-kicker"><Truck size={14} aria-hidden="true" />Приёмка накладных</p>
          <ul className="mk-acc-list">
            {INVOICES.map((d) => (
              <li key={d.name}>
                <span className="mk-acc-name">{d.name}</span>
                <b className="mk-acc-date" data-soon={d.warn}>{d.status}</b>
              </li>
            ))}
          </ul>
        </section>

        <section className="mk-card mk-acc-block" aria-label="Остатки">
          <p className="mk-cab-kicker"><Package size={14} aria-hidden="true" />Заканчивается, пора заказать</p>
          <ul className="mk-acc-list">
            {STOCK.map((d) => (
              <li key={d.what}>
                <span className="mk-acc-name">{d.what}</span>
                <b className="mk-acc-date" data-soon={d.warn}>{d.left}</b>
              </li>
            ))}
          </ul>
        </section>

        <section className="mk-card mk-acc-block" aria-label="Чек-лист точки">
          <p className="mk-cab-kicker"><ClipboardCheck size={14} aria-hidden="true" />Чек-лист точки</p>
          <ul className="mk-acc-list">
            {CHECKS.map((c) => (
              <li key={c.what}>
                <span className="mk-acc-name">{c.what}</span>
                {c.ok ? <Check size={16} aria-label="Выполнено" /> : <b className="mk-acc-date" data-soon="true">Впереди</b>}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
