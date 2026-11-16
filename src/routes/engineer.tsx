import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity, RefreshCw, AlertTriangle, BookOpen, Check, Cpu, History, Phone, Search, Wrench } from "lucide-react";
import { BackHome } from "@/components/back-home";
import { ReregPanel, type RegCase } from "@/components/rereg-panel";
import { OfdWatchPanel } from "@/components/ofd-watch-panel";
import type { ShiftCheck } from "@/lib/reconciliation";
import { RefusalAiPanel } from "@/components/refusal-ai-panel";
import { QuarantinePanel } from "@/components/quarantine-panel";
import { quarantineSummary, type QuarantineCheck } from "@/lib/quarantine";

export const Route = createFileRoute("/engineer")({
  head: () => ({
    meta: [
      { title: "Кабинет мастера · Мастер Касс" },
      { name: "description", content: "Рабочий кабинет сервисного инженера: поиск кассы, технический паспорт, ресурс ФН, связь, сбои и журнал выездов." },
      { property: "og:title", content: "Кабинет мастера · Мастер Касс" },
      { property: "og:description", content: "Паспорт кассы и её состояние за пять секунд." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Engineer,
});

type Link = "ok" | "warn" | "bad";
type Kassa = {
  id: string; client: string; owner: string; phone: string; inn: string; address: string;
  model: string; serial: string; firmware: string; link: Link; lastDoc: string;
  fn: string; fnDays: number; fnDate: string; ofd: string; ofdUntil: string; rnm: string;
  alerts: string[]; history: { date: string; who: string; what: string }[];
};

const KASSY: Kassa[] = [
  {
    id: "1", client: "Кофейня «Утро», точка №1", owner: "Алексей Морозов", phone: "+7 918 555-12-34", inn: "616100123456",
    address: "Ростов-на-Дону, ул. Пушкинская, 45", model: "Эвотор 7.3", serial: "00307301234567", firmware: "4.9.12",
    link: "ok", lastDoc: "чек 3 минуты назад", fn: "7281440500123456", fnDays: 212, fnDate: "7 июня 2027",
    ofd: "Такском", ofdUntil: "12 марта 2027", rnm: "0006543210012345", alerts: [],
    history: [{ date: "14 сен", who: "Сергей В.", what: "Замена блока питания, проверено пробитие чека" }],
  },
  {
    id: "2", client: "Кофейня «Утро», точка №2", owner: "Алексей Морозов", phone: "+7 918 555-12-34", inn: "616100123456",
    address: "Ростов-на-Дону, пр. Будённовский, 12", model: "Эвотор 7.2", serial: "00307209876543", firmware: "4.9.8",
    link: "warn", lastDoc: "смена закрыта 2 дня назад", fn: "7281440500654321", fnDays: 24, fnDate: "1 декабря 2026",
    ofd: "Первый ОФД", ofdUntil: "20 ноября 2026", rnm: "0006543210067890",
    alerts: ["ФН заканчивается через 24 дня", "Подписка ОФД истекает 20 ноября", "Прошивка устарела, доступна 4.9.12"],
    history: [{ date: "2 авг", who: "Ирина Л.", what: "Обновление кассового модуля, настройка весов" }],
  },
  {
    id: "3", client: "Магазин «Фермер»", owner: "Наталья Ким", phone: "+7 928 777-45-67", inn: "616400987654",
    address: "Батайск, ул. Ленина, 8", model: "Эвотор 5i", serial: "00305505554433", firmware: "4.8.3",
    link: "bad", lastDoc: "последний чек 6 дней назад", fn: "7281440500777888", fnDays: 95, fnDate: "10 февраля 2027",
    ofd: "Такском", ofdUntil: "5 января 2027", rnm: "0006543210099999",
    alerts: ["Касса молчит 6 дней: проверить интернет", "14 неотправленных чеков в ОФД"],
    history: [{ date: "20 окт", who: "Сергей В.", what: "Чистка печатающей головки" }],
  },
];

const NOW = new Date();
const hAgo = (n: number) => new Date(NOW.getTime() - n * 3_600_000);
const RESCUE = (serial: string, rnm: string, fn: string) => ({ serial, rnm, closeDoc: "1842", closeSign: "3150219876", regDoc: "1843", regSign: "0427761530", newFn: fn });
const REG: Record<string, RegCase> = {
  "1": { replacedAt: hAgo(14), fias: { found: true, houseNumber: "45" }, checks: [{ at: hAgo(13), answer: "reregistered" }, { at: hAgo(1), answer: "reregistered" }], rescue: RESCUE("00307301234567", "0006543210012345", "7281440500123456") },
  "3": { replacedAt: hAgo(40), fias: { found: true, houseNumber: "" }, checks: [{ at: hAgo(39), answer: "reregistered" }, { at: hAgo(18), answer: "refused", reason: "адрес установки не найден в ФИАС" }], rescue: RESCUE("00305505554433", "0006543210099999", "7281440500777888") },
};

const QUAR: Record<string, QuarantineCheck[]> = {
  "2": [
    { doc: "148", at: hAgo(5), sum: 389, reason: "marking", tag: "2106" },
    { doc: "151", at: hAgo(3), sum: 214, reason: "marking", tag: "2106" },
    { doc: "153", at: hAgo(2), sum: 640, reason: "regFlags", tag: "1207" },
  ],
  "3": [{ doc: "902", at: hAgo(30), sum: 1250, reason: "time" }],
};

const dIn = (n: number) => new Date(NOW.getTime() + n * 86_400_000);
const SD = { shift: 12, sales: 8375.9, refunds: 0, cash: 2000, card: 6375.9, checks: 17 };
const OFDW: Record<string, { unsent: number; oldest: Date | null; until: Date; shift: ShiftCheck }> = {
  "1": { unsent: 0, oldest: null, until: dIn(116), shift: { register: SD, ofd: SD, openedAt: hAgo(14), closedAt: hAgo(2) } },
  "2": { unsent: 3, oldest: hAgo(9), until: dIn(4), shift: { register: SD, ofd: { ...SD, sales: 7175.9, card: 5175.9, checks: 16 }, openedAt: hAgo(14), closedAt: hAgo(2) } },
  "3": { unsent: 14, oldest: hAgo(6 * 24), until: dIn(50), shift: { register: { ...SD, shift: 40 }, ofd: null, openedAt: hAgo(30), closedAt: null } },
};

const ERRORS = [
  { code: "Ошибка 3924", fix: "Нет связи с ОФД: проверить интернет, дату и время, настройки ОФД в разделе «Настройки → ОФД»." },
  { code: "Касса заблокирована по дате", fix: "Сверить дату в ФН и в системе, закрыть смену, перезагрузить кассу." },
  { code: "ФН переполнен", fix: "Отправить чеки в ОФД, затем плановая замена ФН с закрытием архива." },
];

type Diag = { label: string; value: string; note: string; tone: Link };
const DIAG: Record<string, Diag[]> = {
  "1": [
    { label: "Батарея", value: "86%", note: "заряжается от сети", tone: "ok" },
    { label: "Бумага", value: "Есть", note: "крышка закрыта", tone: "ok" },
    { label: "Связь", value: "Wi-Fi −58 дБм", note: "ОФД отвечает за 180 мс", tone: "ok" },
    { label: "ФН", value: "Исправен", note: "0 неотправленных, смена 5 ч", tone: "ok" },
    { label: "Память", value: "41% свободно", note: "3,2 ГБ", tone: "ok" },
    { label: "Часы", value: "Точно", note: "расхождение 2 сек", tone: "ok" },
  ],
  "2": [
    { label: "Батарея", value: "14%", note: "нет зарядки, проверьте провод", tone: "bad" },
    { label: "Бумага", value: "Заканчивается", note: "крышка закрыта", tone: "warn" },
    { label: "Связь", value: "SIM −89 дБм", note: "ОФД отвечает за 1 900 мс", tone: "warn" },
    { label: "ФН", value: "3 неотправленных", note: "самый старый с 15:40, смена 9 ч", tone: "warn" },
    { label: "Память", value: "4% свободно", note: "0,3 ГБ, касса может зависать", tone: "bad" },
    { label: "Часы", value: "Отстают", note: "на 3 мин 12 сек", tone: "warn" },
  ],
};

const LINK_TEXT: Record<Link, string> = { ok: "На связи", warn: "Давно не было чеков", bad: "Нет связи" };

function fnTone(d: number) { return d < 30 ? "bad" : d <= 60 ? "warn" : "ok"; }

function Engineer() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string>("2");
  const [note, setNote] = useState("");
  const [extra, setExtra] = useState<Record<string, { date: string; who: string; what: string }[]>>({});

  const found = useMemo(() => {
    const s = q.trim().toLowerCase().replace(/[\s()+-]/g, "");
    if (!s) return KASSY;
    return KASSY.filter((k) => [k.phone, k.serial, k.fn, k.inn, k.client, k.address]
      .some((v) => v.toLowerCase().replace(/[\s()+-]/g, "").includes(s)));
  }, [q]);

  const [diagBusy, setDiagBusy] = useState(false);
  const [diagFor, setDiagFor] = useState<string | null>(null);
  const [diagAt, setDiagAt] = useState("");

  const quarKassy = KASSY.filter((x) => quarantineSummary(QUAR[x.id] ?? [], NOW).count > 0);
  const k = KASSY.find((x) => x.id === sel) ?? KASSY[0]!;

  function runDiag() {
    setDiagBusy(true);
    const id = k.id;
    setTimeout(() => {
      setDiagFor(id);
      setDiagAt(new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }));
      setDiagBusy(false);
    }, id === "3" ? 2500 : 1400);
  }
  const hist = [...(extra[k.id] ?? []), ...k.history];

  return (
    <main className="mk-page mk-cab min-h-screen">
      <BackHome />
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-24">
        <header className="mk-cab-head">
          <div>
            <p className="mk-cab-org">Кабинет мастера</p>
            <p className="mk-cab-muted">Сергей В. · сервисный инженер · 3 кассы требуют внимания</p>
          </div>
          <span className="mk-csh-status"><Wrench size={14} aria-hidden="true" />На смене</span>
        </header>

        {quarKassy.length > 0 && (
          <section className="mk-card mk-acc-block" aria-label="Сигнал карантина">
            <p className="mk-cab-kicker"><AlertTriangle size={14} aria-hidden="true" />Касс с чеками в карантине: {quarKassy.length}</p>
            <ul className="mk-acc-list">
              {quarKassy.map((x) => (
                <li key={x.id}><button type="button" className="mk-eng-row" data-active={x.id === k.id} onClick={() => setSel(x.id)}>
                  <span className="mk-eng-dot" data-tone="bad" aria-hidden="true" />
                  <span className="mk-acc-name">{x.client}<small>{quarantineSummary(QUAR[x.id]!, NOW).count} в карантине — открыть</small></span>
                </button></li>
              ))}
            </ul>
          </section>
        )}

        <section className="mk-card mk-acc-block" aria-label="Поиск кассы">
          <label className="mk-eng-search">
            <Search size={18} aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Телефон, заводской номер, ФН, ИНН или адрес" aria-label="Поиск кассы" />
          </label>
          <ul className="mk-acc-list">
            {found.map((x) => (
              <li key={x.id}>
                <button type="button" className="mk-eng-row" data-active={x.id === k.id} onClick={() => { setSel(x.id); setNote(""); }}>
                  <span className="mk-eng-dot" data-tone={x.link} aria-hidden="true" />
                  <span className="mk-acc-name">{x.client}<small>{x.model} · {x.address}</small></span>
                </button>
              </li>
            ))}
            {found.length === 0 && <li className="mk-cab-muted">Ничего не нашлось. Проверьте номер.</li>}
          </ul>
        </section>

        <section className="mk-card mk-acc-block" aria-label="Паспорт кассы">
          <p className="mk-cab-kicker"><Cpu size={14} aria-hidden="true" />Паспорт кассы</p>
          <p className="mk-cab-org">{k.client}</p>
          <p className="mk-cab-muted">{k.owner} · ИНН {k.inn}</p>
          <a className="mk-eng-call" href={`tel:${k.phone.replace(/[^\d+]/g, "")}`}><Phone size={15} aria-hidden="true" />{k.phone}</a>

          <div className="mk-eng-grid">
            <div className="mk-eng-tile" data-tone={k.link}><small>Связь</small><b>{LINK_TEXT[k.link]}</b><span>{k.lastDoc}</span></div>
            <div className="mk-eng-tile" data-tone={fnTone(k.fnDays)}><small>Ресурс ФН</small><b>{k.fnDays} дн.</b><span>замена до {k.fnDate}</span></div>
          </div>

          <ul className="mk-acc-list">
            {[["Модель", k.model], ["Заводской номер", k.serial], ["Прошивка", k.firmware], ["Номер ФН", k.fn],
              ["ОФД", `${k.ofd}, до ${k.ofdUntil}`], ["РН ККТ", k.rnm]].map(([a, b]) => (
              <li key={a}><span className="mk-acc-name">{a}</span><b className="mk-acc-date">{b}</b></li>
            ))}
          </ul>
        </section>

        <ReregPanel c={REG[k.id]} now={NOW} />

        <OfdWatchPanel {...OFDW[k.id]!} now={NOW} />

        <QuarantinePanel checks={QUAR[k.id] ?? []} serial={k.serial} client={k.client} now={NOW} />

        <RefusalAiPanel context={`${k.client}, ${k.model}, адрес ${k.address}, ОФД ${k.ofd}, прошивка ${k.firmware}`} />

        <section className="mk-card mk-acc-block" aria-label="Диагностика железа">
          <p className="mk-cab-kicker"><Activity size={14} aria-hidden="true" />Диагностика железа</p>
          <p className="mk-cab-muted">Живой опрос кассы в момент обращения: батарея, бумага, связь, ФН и память.</p>
          <button type="button" className="mk-eng-diag-btn" disabled={diagBusy} onClick={runDiag}>
            <RefreshCw size={16} aria-hidden="true" className={diagBusy ? "animate-spin" : ""} />
            {diagBusy ? "Опрос кассы…" : "Диагностировать кассу"}
          </button>
          {diagFor === k.id && diagAt && !diagBusy && (
            k.link === "bad" ? (
              <p className="mk-eng-diag-none">Касса не ответила за 20 секунд. Скорее всего, нет интернета или касса выключена. Позвоните клиенту.</p>
            ) : (
              <>
                <p className="mk-cab-muted">Обновлено только что, {diagAt}</p>
                <div className="mk-eng-grid">
                  {DIAG[k.id]!.map((d) => (
                    <div key={d.label} className="mk-eng-tile" data-tone={d.tone}><small>{d.label}</small><b>{d.value}</b><span>{d.note}</span></div>
                  ))}
                </div>
              </>
            )
          )}
          <p className="mk-cab-muted" style={{ fontSize: 12 }}>Демо: реальный опрос заработает после установки приложения «МастерКасс» на кассу.</p>
        </section>

        <section className="mk-card mk-acc-block" aria-label="Предупреждения">
          <p className="mk-cab-kicker"><AlertTriangle size={14} aria-hidden="true" />Предупреждения</p>
          {k.alerts.length === 0 ? (
            <p className="mk-cab-muted"><Check size={14} className="inline" aria-hidden="true" /> Всё в порядке, замечаний нет.</p>
          ) : (
            <ul className="mk-acc-list">
              {k.alerts.map((a) => <li key={a}><span className="mk-acc-name">{a}</span><b className="mk-acc-date" data-soon="true">Важно</b></li>)}
            </ul>
          )}
        </section>

        <section className="mk-card mk-acc-block" aria-label="Журнал выездов">
          <p className="mk-cab-kicker"><History size={14} aria-hidden="true" />Журнал выездов и ремонтов</p>
          <form className="mk-eng-form" onSubmit={(e) => {
            e.preventDefault();
            if (!note.trim()) return;
            setExtra({ ...extra, [k.id]: [{ date: "сегодня", who: "Сергей В.", what: note.trim() }, ...(extra[k.id] ?? [])] });
            setNote("");
          }}>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Что сделано на выезде" aria-label="Что сделано на выезде" />
            <button type="submit" disabled={!note.trim()}>Зафиксировать</button>
          </form>
          <ul className="mk-acc-list">
            {hist.map((h, i) => <li key={i}><span className="mk-acc-name">{h.what}<small>{h.who}</small></span><b className="mk-acc-date">{h.date}</b></li>)}
          </ul>
          <p className="mk-cab-muted">Демо: запись пока не уходит в Битрикс24 и не сохраняется после обновления.</p>
        </section>

        <section className="mk-card mk-acc-block" aria-label="Частые сбои">
          <p className="mk-cab-kicker"><BookOpen size={14} aria-hidden="true" />Шпаргалка частых сбоев</p>
          <ul className="mk-acc-list">
            {ERRORS.map((e) => <li key={e.code}><span className="mk-acc-name">{e.code}<small>{e.fix}</small></span></li>)}
          </ul>
        </section>
        <p className="mk-cab-muted">Мастер видит только технические данные кассы. Выручка и деньги клиента здесь не показываются.</p>
      </div>
    </main>
  );
}
