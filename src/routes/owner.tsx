import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { FileText, Keyboard, Mic, Paperclip, Plus, Send, X } from "lucide-react";
import { BackHome } from "@/components/back-home";
import { OwnerBoard } from "@/components/owner-dashboards";
import { BreakevenPanel } from "@/components/breakeven-panel";
import { DataPathDoc, FileDownload, ACCOUNTING_DOC_NAME, AGENT_DOC_NAME, DIAG_DOC_NAME, LOYALTY_DOC_NAME, DATA_PATH_DOC_NAME, EVOTOR_DOC_NAME, FN_DOC_NAME, OFD_DOC_NAME, OWNER_DOCS } from "@/components/data-path-doc";
import { useServerFn } from "@tanstack/react-start";
import { createFnReplacementTask, createLinkSilenceTask, getEvotorCabinet, troubleshootCashRegister } from "@/lib/evotor.functions";
import { linkStatus, linkNeedsTask } from "@/lib/evotor";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "Пространство «Хозяин» · Мастер Касс" },
      { name: "description", content: "Закрытое рабочее пространство компании Мастер Касс: файлы по разделам и стратегический ИИ-помощник." },
      { property: "og:title", content: "Пространство «Хозяин» · Мастер Касс" },
      { property: "og:description", content: "Маркетинг, финансы, интеграции и сотрудники в одном месте вместе с ИИ-помощником." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OwnerPage,
});

type Doc = { name: string; date: string; note: string; href?: string };

const SECTIONS: Record<string, Doc[]> = {
  Маркетинг: [
    { name: "Фирменный стиль интерфейса.docx", date: "7 ноя", note: "Цвета, спектр, шрифт Inter, скругления, кнопки, формы, правила для касс Эвотор", href: "/downloads/stil-interfeysa-masterkass.docx" },
    { name: "Логотип МастерКасс (иконки).zip", date: "6 ноя", note: "Вектор SVG, PNG до 2048 px, иконки для кассы Android и Evotor Market, favicon", href: "/downloads/masterkass-logo.zip" },
    { name: "Кейс кофейни.pdf", date: "28 окт", note: "История владельца: от одной точки до шести" },
    { name: "План рилсов на ноябрь.docx", date: "30 окт", note: "Зоопарк программ, будни кассира" },
  ],
  Финансы: [
    { name: "Тарифы и юниты.xlsx", date: "25 окт", note: "1 950 / 3 850 / 5 650 ₽, себестоимость AI" },
    { name: "Фонд «Новая касса».pdf", date: "20 окт", note: "Модель накопления 750 ₽ в месяц" },
  ],
  Интеграции: [
    { name: ACCOUNTING_DOC_NAME, date: "6 ноя", note: "1С, «Управление ассортиментом» и «МойСклад»: только чтение, какие данные берём" },
    { name: FN_DOC_NAME, date: "5 ноя", note: "Предупреждение за 30 дней, дайджест директора и задача в Битрикс24" },
    { name: EVOTOR_DOC_NAME, date: "5 ноя", note: "Тестовое приложение, токен клиента, ограничения Маркета и шаги" },
    { name: OFD_DOC_NAME, date: "5 ноя", note: "Партнёрский ключ Платформы ОФД, Эвотор и изоляция данных клиентов" },
    { name: DATA_PATH_DOC_NAME, date: "3 ноя", note: "Регламент 152-ФЗ: роли, Битрикс24, «Цифровой сейф» и ИИ" },
    { name: "Битрикс24: приём заявок.docx", date: "1 ноя", note: "Схема от Дениса" },
    { name: "Эвотор: приложение.pdf", date: "2 ноя", note: "Черновик требований" },
  ],
  Сотрудники: [
    { name: "Регламент инженера.docx", date: "15 окт", note: "Выезд, диагностика, отчёт" },
  ],
  Сервис: [
    { name: DIAG_DOC_NAME, date: "7 ноя", note: "Кнопка «Диагностировать кассу»: батарея, бумага, связь, ФН, память" },
    { name: LOYALTY_DOC_NAME, date: "6 ноя", note: "Бонусы на кассе, карты Wallet, бесплатные уведомления, стратегии AI" },
    { name: AGENT_DOC_NAME, date: "6 ноя", note: "Приложение на кассу: память, приложения, зависания, чек" },
    { name: FN_DOC_NAME, date: "5 ноя", note: "Плановая замена ФН: звонок клиенту и выезд за 30 дней" },
    { name: "Nova: сценарии голоса.docx", date: "2 ноя", note: "Обучение голосового сотрудника, ведёт Денис" },
    { name: "Мануал Эвотор: сбои печати.pdf", date: "1 ноя", note: "Материал для обучения ИИ-агентов" },
    { name: "Мануал Касатка: смены и ОФД.pdf", date: "31 окт", note: "Материал для обучения ИИ-агентов" },
  ],
  "AI-помощник": [
    { name: "ТЗ для Жени: база знаний AI.docx", date: "6 ноя", note: "С чего начать: опыт инженеров, карточки, красные линии, голос, проверка", href: "/downloads/tz-zhenya-ai.docx" },
    { name: "Карта работ по обучению AI.docx", date: "6 ноя", note: "5 этапов: опыт инженеров, роли, карточки, проверка, инструкции" },
    { name: "Топ-50 сбоев касс.xlsx", date: "6 ноя", note: "Ошибка, симптом, шаги, когда звать инженера. Заполняет Женя" },
    { name: "Красные линии AI.docx", date: "6 ноя", note: "Что кассиру делать нельзя и когда сразу вызывать инженера" },
    { name: "Глоссарий для голоса.xlsx", date: "6 ноя", note: "ФН, ККТ, ОФД, Эвотор, Честный ЗНАК: ударения и распознавание" },
    { name: "Контрольные вопросы для проверки.xlsx", date: "6 ноя", note: "30-50 реальных вопросов для сравнения моделей" },
    { name: "Модели в РФ: голос и текст.docx", date: "6 ноя", note: "SpeechKit, SaluteSpeech, YandexGPT, GigaChat, свой сервер. Без обходов ограничений" },
  ],
  Биллинг: [
    { name: "Модель юнитов.xlsx", date: "3 ноя", note: "1 юнит = 1 000 токенов ≈ 1 ₽, лимиты тарифов" },
  ],
  Конкуренты: [
    { name: "Срез рынка: Ростов и юг.pdf", date: "5 ноя", note: "8 игроков: тарифы ТО, замена ФН, акции" },
    { name: "Скрытые доплаты конкурентов.docx", date: "4 ноя", note: "Платные выезды, маркировка, лицензии" },
    { name: "КП клиентов от конкурентов", date: "3 ноя", note: "Сюда загружаем предложения, которые показывают клиенты" },
  ],
};

function OwnerPage() {
  const [docs, setDocs] = useState(SECTIONS);
  const [tab, setTab] = useState("Маркетинг");
  const [docOpen, setDocOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [voice, setVoice] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const field = useRef<HTMLTextAreaElement>(null);
  const wantFocus = useRef(false);
  const [answer, setAnswer] = useState<{ q: string; src: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!voice && wantFocus.current) { wantFocus.current = false; field.current?.focus(); }
  }, [voice]);

  const ask = (text: string) => {
    if (!text.trim()) return;
    setAnswer({ q: text, src: (docs[tab] ?? [])[0]?.name ?? "файлы раздела" });
    setQ("");
  };

  return (
    <div className="mk-page min-h-screen">
      <BackHome brand />
      <main className="mk-own">
        <h1 className="mk-own-title">Польза - Диалог - Развитие</h1>

        <section className="mk-card mk-cab-pulse" aria-label="Выручка компании">
          <p className="mk-cab-kicker">Выручка сегодня · все клиенты</p>
          <p className="mk-cab-big">186 400 ₽</p>
          <p className="mk-cab-up">+9% к прошлому вторнику</p>
          <dl className="mk-cab-stats">
            <div><dt>За месяц</dt><dd>1,42 млн ₽</dd></div>
            <div><dt>План месяца</dt><dd>76%</dd></div>
            <div><dt>Клиентов</dt><dd>58</dd></div>
          </dl>
        </section>


        <section className="mk-card mk-csh-ai" aria-label="ИИ-сотрудник">
          <form className="mk-csh-box" onSubmit={(e) => { e.preventDefault(); if (q.trim() || files.length) ask(q.trim() || `Файл: ${files[0]?.name ?? ""}`); setFiles([]); }}>
            {voice ? (
              <div className="mk-csh-voice">
                <span className="mk-wave flex h-5 items-center gap-1" aria-hidden="true">
                  {Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ animationDelay: `${i * 70}ms` }} />)}
                </span>
                <span>Голосовой режим скоро заработает</span>
              </div>
            ) : (
              <textarea ref={field} value={q} onChange={(e) => setQ(e.target.value)} rows={2} placeholder={tab === "Конкуренты" ? "Анализ рынка: цены, тренды, изменения игроков" : `Вопрос по разделу «${tab}»`} aria-label="Вопрос ИИ-сотруднику"
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
                <input type="file" multiple className="sr-only" onChange={(e) => { setFiles([...files, ...Array.from(e.target.files ?? [])]); e.target.value = ""; }} />
              </label>
              <span className="flex-1" />
              <button type="button" onClick={() => { wantFocus.current = true; setVoice(false); }} aria-label="Ввести текстом" className={`mk-csh-ibtn ${voice ? "opacity-50" : ""}`}><Keyboard size={20} aria-hidden="true" /></button>
              <button type="button" onClick={() => setVoice(true)} aria-label="Спросить голосом" className={`mk-csh-ibtn ${voice ? "" : "opacity-60"}`}><Mic size={22} aria-hidden="true" /></button>
              {(q.trim().length > 0 || files.length > 0) && (
                <button type="submit" className="mk-csh-ibtn mk-csh-send" aria-label="Отправить"><Send size={18} aria-hidden="true" /></button>
              )}
            </div>
          </form>
          {answer && (
            <div className="mk-own-answer" role="status">
              <p><b>Вы:</b> {answer.q}</p>
              <p>Демо-ответ. Когда подключим ИИ, здесь будет ответ по вашим документам.</p>
              <small>Основано на файле: {answer.src}</small>
            </div>
          )}
        </section>

        <nav className="mk-own-tabs" aria-label="Разделы">
          {Object.keys(docs).map((s) => (
            <button key={s} type="button" aria-pressed={tab === s} onClick={() => setTab(s)}>
              {s} <span>{(docs[s] ?? []).length}</span>
            </button>
          ))}
        </nav>

        <OwnerBoard section={tab} />
        {tab === "Финансы" && <BreakevenPanel />}

        {tab === "Сервис" && <LinkRadar />}
        {tab === "Сервис" && <CashTroubleshooter />}
        {tab === "Сервис" && <FnTaskTest />}
        {tab === "AI-помощник" && (
          <section className="mk-card mk-own-files" aria-label="План работ по AI-помощнику">
            <h2 className="text-lg font-semibold">Рабочее место Жени: база знаний AI</h2>
            <p className="text-sm opacity-80">Голос встречает и снимает тревогу, текст ведёт по шагам. Модели только российские, без обходов ограничений.</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              <li>Собрать опыт инженеров: топ-50 сбоев Эвотор и Касатка, красные линии.</li>
              <li>Разделить материалы по ролям: кассир, директор, бухгалтер, «Хозяин».</li>
              <li>Упаковать в карточки: ситуация, причина, что проверить, решение, когда звать человека.</li>
              <li>Проверить ответы моделей на контрольных вопросах и отловить выдумки.</li>
              <li>Написать инструкции для каждой роли и регламент передачи инженеру.</li>
            </ol>
          </section>
        )}

        <section className="mk-card mk-own-files" aria-label={`Файлы: ${tab}`}>
          {(docs[tab] ?? []).map((d) => (
            <div
              key={d.name}
              className="mk-own-file"
              {...(OWNER_DOCS[d.name]
                ? { role: "button", tabIndex: 0, style: { cursor: "pointer" }, onClick: () => setDocOpen(d.name), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter") setDocOpen(d.name); } }
                : {})}
            >
              <FileText aria-hidden="true" />
              <div><b>{d.name}</b><span>{d.note}</span></div>
              {d.href ? (
                <FileDownload href={d.href} label="Скачать" className="mk-cab-fnbtn" />
              ) : (
                <time>{d.date}</time>
              )}
            </div>
          ))}
          <button type="button" className="mk-own-upload" onClick={() => fileRef.current?.click()}>
            <Plus aria-hidden="true" />Загрузить файл (PDF, DOCX, таблицы)
          </button>
          <input
            ref={fileRef}
            type="file"
            hidden
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setDocs((p) => ({ ...p, [tab]: [{ name: f.name, date: "сегодня", note: "Загружено вами" }, ...(p[tab] ?? [])] }));
              e.target.value = "";
            }}
          />
        </section>

      </main>
      <DataPathDoc name={docOpen} onClose={() => setDocOpen(null)} />
    </div>
  );
}

const LINK_TEXT = { ok: "на связи", warn: "молчит до 7 дней", alert: "молчит 7+ дней" } as const;

function LinkRadar() {
  const { data, isLoading } = useQuery({ queryKey: ["evotor-cabinet"], queryFn: () => getEvotorCabinet(), staleTime: 60_000 });
  const live = data?.ok ? data : null;
  const link = live ? linkStatus(live.summary.lastEventAt) : null;
  const counts = { ok: 0, warn: 0, alert: 0 };
  if (link) counts[link.level]++;
  const sendLink = useServerFn(createLinkSilenceTask);
  const [linkMsg, setLinkMsg] = useState<string | null>(null);
  const autoSent = useRef(false);
  const report = (r: Awaited<ReturnType<typeof sendLink>>, trigger: "auto" | "test") => {
    if (r.ok) window.__lovableEvents?.track?.("project.bitrix24_task_created", { scenario: "link_silence", trigger });
    else if (r.reason === "bitrix_error" || r.reason === "no_bitrix")
      window.__lovableEvents?.track?.("project.bitrix24_task_failed", { scenario: "link_silence", trigger, reason: r.reason });
  };
  useEffect(() => {
    if (autoSent.current || !link || !linkNeedsTask(link)) return;
    autoSent.current = true;
    window.__lovableEvents?.track?.("project.cash_register_connection_lost", { days_silent: Math.floor(link.hours / 24) });
    sendLink({ data: { test: false } }).then((r) => {
      report(r, "auto");
      setLinkMsg(r.ok ? `Касса молчит 7+ дней: в Битрикс24 создана задача № ${r.id}` : r.error);
    });
  }, [link, sendLink]);
  const testLink = async () => {
    setLinkMsg("Отправляем…");
    const r = await sendLink({ data: { test: true } });
    report(r, "test");
    setLinkMsg(r.ok ? `Тестовая задача создана в Битрикс24: № ${r.id}` : r.error);
  };
  return (
    <section className="mk-card mk-own-files" aria-label="Связь касс клиентов">
      <p><strong>Радар связи касс</strong></p>
      <p className="mk-cab-muted">Если от кассы нет данных, вероятно, пропал интернет и чеки не уходят в ОФД. Через 30 дней ФН блокируется, поэтому связываемся с точкой заранее.</p>
      <p className="mk-link-sum">
        {(["ok", "warn", "alert"] as const).map((l) => (
          <span key={l}><span className="mk-link-dot" data-level={l} aria-hidden="true" />{LINK_TEXT[l]}: {counts[l]}</span>
        ))}
      </p>
      {isLoading ? <p className="mk-cab-muted">Загружаем кассы…</p> : live ? (
        <ul className="mk-link-list">
          {live.devices.map((d) => (
            <li key={d.serial}>
              <span className="mk-link-dot" data-level={link?.level ?? "warn"} aria-hidden="true" />
              {live.store} · {d.model} (№ {d.serial}): {link?.label ?? "данных пока нет"}
            </li>
          ))}
        </ul>
      ) : <p className="mk-cab-muted">{data && !data.ok ? data.error : "Кассы не подключены"}</p>}
      <p className="mk-cab-muted">Если касса молчит 7 дней и дольше, задача на прозвон точки сразу уходит в Битрикс24.</p>
      <button type="button" className="mk-cab-fnbtn" onClick={testLink}>Тест: задача «касса не на связи»</button>
      {linkMsg && <p className="mk-cab-muted">{linkMsg}</p>}
      <p className="mk-cab-muted">Проверка идёт и без открытия кабинета: сервер сверяет связь по расписанию.</p>
    </section>
  );
}

function CashTroubleshooter() {
  const ask = useServerFn(troubleshootCashRegister);
  const [problem, setProblem] = useState("");
  const [state, setState] = useState<{ busy?: boolean; plan?: string; error?: string }>({});
  const go = async (e: FormEvent) => {
    e.preventDefault();
    if (problem.trim().length < 3 || state.busy) return;
    setState({ busy: true });
    try {
      const r = await ask({ data: { problem } });
      setState(r.ok ? { plan: r.plan } : { error: r.error });
    } catch (err) {
      setState({ error: err instanceof Error ? err.message : "Не получилось, попробуйте ещё раз" });
    }
  };
  return (
    <section className="mk-card mk-own-files" aria-label="AI-диагностика кассы">
      <p><strong>AI-диагностика кассы</strong></p>
      <p className="mk-cab-muted">Опишите, что происходит с кассой. Помощник учтёт статус связи и последние события и предложит план действий.</p>
      <form onSubmit={go}>
        <textarea
          className="mk-own-ai-input"
          rows={3}
          maxLength={1500}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Например: касса пишет «нет связи с ОФД», чеки не уходят"
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--border)" }}
        />
        <button type="submit" className="mk-cab-fnbtn" disabled={state.busy || problem.trim().length < 3}>
          {state.busy ? "Составляем план…" : "Составить план устранения"}
        </button>
      </form>
      {state.error && <p className="mk-cab-muted">{state.error}</p>}
      {state.plan && <div className="mk-cab-muted" style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>{state.plan}</div>}
    </section>
  );
}

function FnTaskTest() {
  const send = useServerFn(createFnReplacementTask);
  const [state, setState] = useState<{ busy?: boolean; msg?: string }>({});
  const go = async () => {
    setState({ busy: true });
    const r = await send({ data: { test: true } });
    setState({ msg: r.ok ? `Создано в Битрикс24: ${r.kind === "task" ? "задача" : "лид"} № ${r.id}` : r.error });
  };
  return (
    <section className="mk-card mk-own-files" aria-label="Замена ФН">
      <p><strong>Плановая замена ФН</strong></p>
      <p className="mk-cab-muted">Созвон и согласование счёта, оплата, через 1–2 недели согласование точного времени выезда, замена ФН инженером.</p>
      <button type="button" className="mk-cab-fnbtn" disabled={state.busy} onClick={go}>
        {state.busy ? "Отправляем…" : "Тест: создать задачу в Битрикс24"}
      </button>
      {state.msg && <p className="mk-cab-muted">{state.msg}</p>}
    </section>
  );
}
