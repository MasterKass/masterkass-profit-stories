import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Keyboard, Mic, Send, Wrench, Check, HeartHandshake, GraduationCap, Plus, Paperclip, X } from "lucide-react";
import { BackHome } from "@/components/back-home";

export const Route = createFileRoute("/cashier")({
  head: () => ({
    meta: [
      { title: "Кабинет кассира · Мастер Касс" },
      { name: "description", content: "Кабинет кассира: статус кассы, скрипт лояльности на сегодня, ИИ-наставник голосом и обучение новичка." },
      { property: "og:title", content: "Кабинет кассира · Мастер Касс" },
      { property: "og:description", content: "Помощь на смене за секунды, без поиска инструкций." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Cashier,
});

type Answer = { steps: string[]; hardware?: boolean };

const QUICK: Record<string, Answer> = {
  "Завис чек на терминале": { steps: ["Не пробивайте чек повторно.", "Проверьте на терминале, прошла ли оплата: Меню → Последняя операция.", "Если оплата прошла, закройте чек на кассе как оплаченный картой. Если нет, отмените чек и повторите оплату."] },
  "Возврат по карте": { steps: ["Касса: Возврат → Найти чек по номеру или дате.", "Отметьте товары и выберите оплату «Картой».", "Попросите гостя приложить ту же карту к терминалу."] },
  "Сканер не читает DataMatrix": { steps: ["Протрите стекло сканера.", "Держите код ровно, на расстоянии 10-15 см, без бликов.", "Если не помогло, введите код вручную: Товар → Ввести код маркировки."] },
  "Закрыть вчерашнюю смену": { steps: ["Отчёты → Кассовый отчёт → Закрыть смену.", "Распечатается Z-отчёт за вчера.", "Нажмите «Открыть смену» и работайте как обычно."] },
  "Принтер не режет чек": { steps: ["Выключите кассу и откройте крышку принтера.", "Уберите застрявшую ленту, не трогая нож руками."], hardware: true },
};

const LESSONS: [string, string[]][] = [
  ["Открытие смены и размен", ["Меню → Открыть смену.", "Внесение → укажите сумму размена.", "Проверьте, что касса показывает «Смена открыта»."]],
  ["Оплата частями: наличные и карта", ["Пробейте товары, нажмите «Оплата».", "Выберите «Смешанная», введите сумму наличными.", "Остаток касса предложит оплатить картой."]],
  ["Маркированный товар", ["Сканируйте код DataMatrix, а не штрихкод.", "Касса проверит код в Честном Знаке.", "Если код не прошёл, товар не продавайте и сообщите директору."]],
  ["Возврат и чек коррекции", ["Возврат делайте только по найденному чеку.", "Чек коррекции нужен, если ошибка уже ушла в ОФД.", "Спросите ИИ-наставника, какой вариант подходит."]],
  ["Закрытие смены", ["Проверьте, что все чеки отправлены.", "Отчёты → Закрыть смену.", "Сохраните Z-отчёт."]],
];

function Cashier() {
  const [q, setQ] = useState("");
  const [voice, setVoice] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);
  const wantFocus = useRef(false);
  const [files, setFiles] = useState<File[]>([]);
  const [asked, setAsked] = useState<string | null>(null);
  const [called, setCalled] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const ask = (text: string) => { setAsked(text); setCalled(false); setQ(""); };
  const answer: Answer | null = asked
    ? QUICK[asked] ?? { steps: ["В демо-режиме ИИ отвечает на быстрые вопросы ниже. Живые ответы подключим после запуска."] }
    : null;

  useEffect(() => {
    if (!voice && wantFocus.current) { wantFocus.current = false; field.current?.focus(); }
  }, [voice]);

  return (
    <main className="mk-page mk-cab min-h-screen">
      <BackHome />
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-24">
        <header className="mk-cab-head">
          <div className="flex items-center gap-3">
            <div>
              <p className="mk-cab-org">Кофейня «Утро»</p>
              <p className="mk-cab-muted">Анна К. · кассир · смена с 08:00</p>
            </div>
          </div>
          <span className="mk-csh-status"><Check size={14} aria-hidden="true" />Касса в сети, чеки уходят</span>
        </header>

        <section className="mk-card mk-csh-script" aria-label="Скрипт лояльности на сегодня">
          <p className="mk-cab-kicker"><HeartHandshake size={14} aria-hidden="true" />Что сказать гостю сегодня</p>
          <p className="mk-csh-quote">«Хотите, начислим 100 приветственных бонусов на десерт прямо сейчас по номеру телефона?»</p>
          <ul className="mk-csh-rules">
            <li>Начисляем 5% с каждой покупки</li>
            <li>Бонусами можно оплатить до 30% чека</li>
            <li>Бонусы сгорают через 30 дней без покупок</li>
          </ul>
        </section>

        <section className="mk-card mk-csh-ai" aria-label="ИИ-наставник">
          <h2 className="mk-csh-title">Задайте вопрос ИИ-помощнику</h2>
          <form className="mk-csh-box" onSubmit={(e) => { e.preventDefault(); if (q.trim() || files.length) ask(q.trim() || `Фото: ${files[0]?.name ?? ""}`); setFiles([]); }}>
            {voice ? (
              <div className="mk-csh-voice">
                <span className="mk-wave flex h-5 items-center gap-1" aria-hidden="true">
                  {Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ animationDelay: `${i * 70}ms` }} />)}
                </span>
                <span>Голосовой режим скоро заработает</span>
              </div>
            ) : (
              <textarea ref={field} value={q} onChange={(e) => setQ(e.target.value)} rows={2} placeholder="Опишите, что случилось на кассе" aria-label="Вопрос ИИ-сотруднику"
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
              <label className="mk-csh-ibtn" aria-label="Прикрепить фото или файл">
                <Plus size={22} aria-hidden="true" />
                <input type="file" multiple accept="image/*,.pdf,.txt" className="sr-only" onChange={(e) => { setFiles([...files, ...Array.from(e.target.files ?? [])]); e.target.value = ""; }} />
              </label>
              <span className="flex-1" />
              <button type="button" onClick={() => { wantFocus.current = true; setVoice(false); }} aria-label="Ввести текстом" className={`mk-csh-ibtn ${voice ? "opacity-50" : ""}`}><Keyboard size={20} aria-hidden="true" /></button>
              <button type="button" onClick={() => setVoice(true)} aria-label="Спросить голосом" className={`mk-csh-ibtn ${voice ? "" : "opacity-60"}`}><Mic size={22} aria-hidden="true" /></button>
              {(q.trim().length > 0 || files.length > 0) && (
                <button type="submit" className="mk-csh-ibtn mk-csh-send" aria-label="Отправить"><Send size={18} aria-hidden="true" /></button>
              )}
            </div>
          </form>
          <div className="mk-csh-chips">
            {Object.keys(QUICK).map((k) => (
              <button key={k} type="button" onClick={() => ask(k)} data-active={asked === k}>{k}</button>
            ))}
          </div>

          {answer && (
            <div className="mk-csh-answer" role="status">
              <p className="mk-csh-asked">{asked}</p>
              <ol>{answer.steps.map((s) => <li key={s}>{s}</li>)}</ol>
              {answer.hardware && (
                <div className="mk-csh-eng">
                  <p>Похоже на поломку механизма: инструкцией это не исправить. Передать заявку дежурному инженеру на вашу точку?</p>
                  {called ? (
                    <p className="mk-csh-sent"><Check size={16} aria-hidden="true" />Заявка передана. Инженер свяжется с точкой.</p>
                  ) : (
                    <button type="button" onClick={() => setCalled(true)}><Wrench size={16} aria-hidden="true" />Передать инженеру</button>
                  )}
                </div>
              )}
            </div>
          )}
          <p className="mk-cab-muted mt-3">Вопросы кассира к ИИ не расходуют юниты.</p>
        </section>

        <p className="mk-cab-kicker mt-8"><GraduationCap size={14} aria-hidden="true" />Обучение</p>
        <div className="mk-cab-list" style={{ marginTop: ".5rem" }}>
          {LESSONS.map(([title, steps], i) => {
            const isOpen = open === i;
            return (
              <section key={title} className="mk-card mk-cab-sec">
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                  <span className="mk-cab-ico">{i + 1}</span>
                  <span className="mk-cab-title flex-1 text-left">{title}</span>
                  <ChevronDown size={18} className="mk-cab-chev" data-open={isOpen} aria-hidden="true" />
                </button>
                {isOpen && <ol className="mk-csh-steps">{steps.map((s) => <li key={s}>{s}</li>)}</ol>}
              </section>
            );
          })}
        </div>
        <p className="mk-cab-muted mt-6">Демо-режим: данные и ответы примерные.</p>
      </div>
    </main>
  );
}
