import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronDown, Wallet, HeartHandshake, FileSignature, Package, Users, MonitorSmartphone, Landmark, Mic, Sparkles,  Settings2, ShieldCheck,
} from "lucide-react";
import { LoyaltyAdmin, LoyaltySettings } from "@/components/loyalty-admin";
import { CareHistory } from "@/components/care-history";
import { BackHome } from "@/components/back-home";
import { BrandMark } from "@/components/brand-mark";
import { useQuery } from "@tanstack/react-query";
import { getEvotorCabinet } from "@/lib/evotor.functions";
import { fnNeedsAlert, linkStatus } from "@/lib/evotor";
import { quarantineSummary, QUARANTINE_INFO, type QuarantineCheck } from "@/lib/quarantine";
import { unsentState, ofdSubState, OFD_PACKS } from "@/lib/ofd-watch";
import { reconcileShift, revenue, type ShiftCheck } from "@/lib/reconciliation";

const rub = (n: number) => `${n.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽`;
const fmtDay = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
const fmtDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

export const Route = createFileRoute("/cabinet")({
  head: () => ({
    meta: [
      { title: "Кабинет директора · Мастер Касс" },
      { name: "description", content: "Пульт директора: выручка дня, финансы, лояльность, ЭДО, ассортимент, сотрудники, оборудование и новости госрегулирования." },
      { property: "og:title", content: "Кабинет директора · Мастер Касс" },
      { property: "og:description", content: "Всё о вашей точке на одном экране." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Cabinet,
});

type Section = { id: string; title: string; icon: typeof Wallet; summary: string; rows: [string, string][] };

const SECTIONS: Section[] = [
  { id: "finance", title: "Финансы", icon: Wallet, summary: "Месяц: 1 240 000 ₽ · план выполнен на 82%", rows: [
    ["Выручка за месяц", "1 240 000 ₽"], ["План на месяц", "1 510 000 ₽"], ["Средний чек за неделю", "648 ₽"],
    ["Ближайший платёж", "ОФД, 1 800 ₽ · 12 ноября"], ["Фонд «Новая касса»", "накоплено 4 500 ₽"],
  ] },
  { id: "loyalty", title: "Гости и акции МК Бонус", icon: HeartHandshake, summary: "База гостей, сегменты, карта в Wallet", rows: [
    ["Постоянные гости", "186"], ["Новые карты за неделю", "14"], ["Списано бонусов", "3 400"], ["Вернулись за 30 дней", "61%"],
  ] },
  { id: "edo", title: "Поставщики и ЭДО", icon: FileSignature, summary: "1 накладная ждёт подписи", rows: [
    ["«Кофе-Опт»", "24 500 ₽ · ждёт подписи"], ["«Молочный двор»", "14 200 ₽ · подписано"], ["Документов за неделю", "9"],
  ] },
  { id: "assortment", title: "Ассортимент", icon: Package, summary: "Топ: капучино 300 мл · 34% выручки", rows: [
    ["Лидер продаж", "Капучино 300 мл, 34%"], ["Растёт", "Раф лавандовый, +18%"], ["Заканчивается", "Сироп ваниль, 1 шт"],
  ] },
  { id: "staff", title: "Сотрудники и доступы", icon: Users, summary: "Подключено 2 из 3 сотрудников", rows: [
    ["Анна К. · кассир", "на смене с 08:00"], ["Ирина П. · бухгалтер", "была в сети вчера"], ["Свободно мест", "1 из 3"],
  ] },
  { id: "equipment", title: "Оборудование", icon: MonitorSmartphone, summary: "Эвотор 7.2 · связь отличная", rows: [
    ["Касса №1", "Эвотор 7.2 · в сети"], ["Подписка ОФД", "до 20 ноября · продление 3 500 ₽ / 9 000 ₽"], ["Чеки в налоговую", "3 не отправлены · 2 в карантине"], ["Сверка с ОФД", "смена №12: расхождение 1 200 ₽, 1 чек не дошёл"], ["Фискальный накопитель", "действует ещё 45 дней"], ["Износ кассы", "38% · замена через фонд"],
  ] },
  { id: "news", title: "Новости госрегулирования", icon: Landmark, summary: "Разрешительный режим: касса обновлена", rows: [
    ["Маркировка молочной продукции", "проверено, ошибок нет"], ["Разрешительный режим", "касса готова"], ["Новые форматы ФФД", "обновление не требуется"],
  ] },
  { id: "settings", title: "МК Бонус Настройки", icon: Settings2, summary: "Правила баллов, кассы", rows: [] },
];

function Cabinet() {
  const [open, setOpen] = useState<string | null>(null);
  const { data: live, isLoading } = useQuery({ queryKey: ["evotor-cabinet"], queryFn: () => getEvotorCabinet(), staleTime: 60_000 });
  const link = live?.ok ? linkStatus(live.summary.lastEventAt) : null;
  // Демо: ЭДО и остатки всегда дают предупреждения ниже
  const attn = true;
  return (
    <main className="mk-page mk-cab min-h-screen">
      <BackHome />
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-24">
        <header className="mk-cab-head">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="mk-cab-org">{live?.ok ? live.store : "Кофейня «Утро»"}</p>
              <p className="mk-cab-muted">{live?.ok ? `Директор${live.address ? ` · ${live.address}` : ""}` : "Директор · демо-данные"}</p>
            </div>
          </div>
          <div className="mk-cab-headr">
            <span className="mk-cab-units"><Sparkles size={14} aria-hidden="true" />1 300 AI-юнитов</span>
            <button type="button" className="mk-cab-light" data-level={attn ? "warn" : "ok"} onClick={() => document.getElementById("attn")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              <span className="mk-link-dot" data-level={attn ? "warn" : "ok"} aria-hidden="true" />{attn ? "Требует внимания" : "Всё в порядке"}
            </button>
          </div>
        </header>

        {live?.ok ? (
          <section className="mk-card mk-cab-pulse" aria-label="Касса Эвотор">
            <p className="mk-cab-big">{rub(live.summary.revenue)}</p>
            <p className="mk-cab-muted">
              {live.summary.day ? `Выручка за ${fmtDay(live.summary.day)}` : "Продаж за 14 дней нет"}
              {live.summary.refunds ? ` · возвратов: ${live.summary.refunds}` : ""}
            </p>
            <dl className="mk-cab-stats">
              <div><dt>Чеков</dt><dd className="mk-cab-num">{live.summary.receipts}</dd></div>
              <div><dt>Средний чек</dt><dd className="mk-cab-num">{rub(live.summary.avgCheck)}</dd></div>
              <div><dt>Новых карт лояльности</dt><dd className="mk-cab-num">+14</dd></div>
            </dl>
          </section>
        ) : (
          <section className="mk-card mk-cab-pulse" aria-label="Сегодня на точке">
            {isLoading && <p className="mk-cab-kicker">Загружаем данные кассы…</p>}
            <p className="mk-cab-big">48 650 ₽</p>
            <p className="mk-cab-up">{live && !live.ok ? live.error : "+12% к прошлому вторнику"}</p>
            <dl className="mk-cab-stats">
              <div><dt>Чеков</dt><dd className="mk-cab-num">73</dd></div>
              <div><dt>Средний чек</dt><dd className="mk-cab-num">665 ₽</dd></div>
              <div><dt>Новых карт лояльности</dt><dd className="mk-cab-num">+14</dd></div>
            </dl>
          </section>
        )}

        <button type="button" className="mk-cab-ask"><Mic size={16} aria-hidden="true" />Спросить AI: «Сравни выручку этой недели с прошлой»</button>

        <section className="mk-card mk-cab-bonus" aria-label="МК Бонус">
          <p className="mk-cab-kicker">Система лояльности ваших клиентов</p>
          <p className="mk-cab-muted">11–17 ноября</p>
          <dl className="mk-cab-stats">
            <div><dt>Выручки от гостей с картой</dt><dd>68%</dd></div>
            <div><dt>Новых карт</dt><dd>+14</dd></div>
            <div><dt>Средний чек с картой</dt><dd>890 ₽ <small className="mk-cab-muted">без — 520 ₽</small></dd></div>
            <div><dt>Списано баллов</dt><dd>3 400</dd></div>
          </dl>
          <p className="mk-cab-muted"><Sparkles size={13} aria-hidden="true" /> 38 гостей не были больше 30 дней — напомнить им можно в «Гости и акции».</p>
        </section>

        <section className="mk-card mk-cab-attn" id="attn" aria-label="Требует внимания">
          <p className="mk-cab-kicker">Требует внимания</p>
          <p className="mk-cab-okline"><ShieldCheck size={14} aria-hidden="true" />Касса в сети · маркировка без ошибок</p>
          <ul>
            {live?.fn && <FnAlert fn={live.fn} />}
            {link && link.level !== "ok" && (
              <li data-tone="warn">
                Касса не передаёт данные {Math.floor(link.hours / 24)} дн. Проверьте интернет на точке: если чеки не уходят в ОФД 30 дней, касса заблокируется.
              </li>
            )}
            <OfdAlerts />
            <li data-tone="warn">ЭДО: накладная «Кофе-Опт» на 24 500 ₽ ждёт подписи</li>
            <li data-tone="warn">Сироп ваниль заканчивается: остался 1 шт</li>
          </ul>
        </section>


        <div className="mk-cab-list">
          {SECTIONS.map((s) => {
            const isOpen = open === s.id;
            const Icon = s.icon;
            return (
              <section key={s.id} className="mk-card mk-cab-sec">
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : s.id)}>
                  <span className="mk-cab-ico"><Icon size={18} aria-hidden="true" /></span>
                  <span className="flex-1 text-left">
                    <span className="mk-cab-title">{s.title}</span>
                    <span className="mk-cab-muted">{s.id === "equipment" && live?.ok ? `${live.devices[0]?.model ?? "Эвотор"}${link ? ` · ${link.label}` : ""}` : s.summary}</span>
                  </span>
                  <ChevronDown size={18} className="mk-cab-chev" data-open={isOpen} aria-hidden="true" />
                </button>
                {isOpen && s.id === "loyalty" && <LoyaltyAdmin />}
                {isOpen && s.id === "settings" && <LoyaltySettings />}
                {isOpen && s.id !== "loyalty" && s.id !== "settings" && (
                  <dl className="mk-cab-rows">
                    {s.id === "equipment" && live?.ok && (<>
              {live.devices.map((d) => (
                <div key={d.serial}><dt>{d.name}</dt><dd>{d.model} · зав. № {d.serial}</dd></div>
              ))}
              <div><dt>Смена</dt><dd>{live.summary.sessionOpen ? "открыта" : "закрыта"}</dd></div>
              {live.summary.fnSerial && <div><dt>Фискальный накопитель</dt><dd>№ {live.summary.fnSerial}</dd></div>}
              {live.fn && (
                <div>
                  <dt>Срок ФН (оценка)</dt>
                  <dd>
                    {live.fn.daysLeft > 0 ? `осталось ${live.fn.daysLeft} дн., до ${fmtDate(live.fn.until)}` : `истёк ${fmtDate(live.fn.until)}`}
                    <br /><span className="mk-cab-muted">ФН на {live.fn.months} мес., в работе с {fmtDate(live.fn.since)}</span>
                  </dd>
                </div>
              )}
              {live.summary.lastEventAt && <div><dt>Последнее событие</dt><dd>{new Date(live.summary.lastEventAt).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}</dd></div>}
              {link && <div><dt>Связь с кассой</dt><dd><span className="mk-link-dot" data-level={link.level} aria-hidden="true" />{link.label}</dd></div>}
                    </>)}
                    {s.rows.filter(([k]) => !(s.id === "equipment" && live?.ok && (k === "Касса №1" || k === "Фискальный накопитель"))).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                  </dl>
                )}
              </section>
            );
          })}
        </div>

        <CareHistory />
      </div>
    </main>
  );
}

type Fn = { since: string; until: string; daysLeft: number; months: number };

function FnAlert({ fn }: { fn: Fn }) {
  const [preview, setPreview] = useState(false);
  const real = fnNeedsAlert(fn);
  const shown = real || preview;
  const days = real ? fn.daysLeft : 30;
  return (
    <>
      {shown && (
        <li data-tone="warn">
          {days > 0
            ? `ФН: осталось ${days} дн. (до ${fmtDate(fn.until)}). Мы уже готовим замену: менеджер позвонит вам, чтобы согласовать счёт и удобное время приезда инженера.`
            : `ФН: срок истёк ${fmtDate(fn.until)}. Менеджер свяжется с вами для срочной замены.`}
        </li>
      )}
      {!real && (
        <li>
          <button type="button" className="mk-cab-fnbtn" onClick={() => setPreview((v) => !v)}>
            {preview ? "Скрыть пример предупреждения о ФН" : "Показать, как выглядит предупреждение за 30 дней до конца ФН"}
          </button>
        </li>
      )}
    </>
  );
}

// Демо-данные кассы директора (те же правила, что в кабинете мастера). Реальные придут из «Платформы ОФД».
const DEMO_NOW = new Date();
const hAgo = (h: number) => new Date(DEMO_NOW.getTime() - h * 3_600_000);
const DEMO_QUAR: QuarantineCheck[] = [
  { doc: "1184", at: hAgo(20), sum: 890, reason: "marking" },
  { doc: "1191", at: hAgo(6), sum: 420, reason: "marking" },
];
const DEMO_UNSENT = { count: 3, oldest: hAgo(9) };
const DEMO_OFD_UNTIL = new Date(DEMO_NOW.getTime() + 4 * 86_400_000);

const DEMO_SHIFT: ShiftCheck = {
  register: { shift: 12, sales: 8375.9, refunds: 0, cash: 2000, card: 6375.9, checks: 17 },
  ofd: { shift: 12, sales: 7175.9, refunds: 0, cash: 2000, card: 5175.9, checks: 16 },
  openedAt: hAgo(14), closedAt: hAgo(2),
};

function ReconAlert() {
  const [demoOk, setDemoOk] = useState(false);
  const shift = demoOk ? { ...DEMO_SHIFT, ofd: DEMO_SHIFT.register } : DEMO_SHIFT;
  const r = reconcileShift(shift, DEMO_NOW);
  const rub2 = (n: number) => `${n.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽`;
  return (
    <>
      <li data-tone={r.tone === "ok" ? "ok" : r.tone}>
        {r.tone === "ok"
          ? `Сверка с ОФД пройдена: смена №${shift.register.shift}, выручка ${rub2(revenue(shift.register))} совпадает.`
          : <>Сверка смены №{shift.register.shift} с ОФД: {r.issues.map((i) => i.text).join(" ")} Мастер проверит, что чеки дошли.</>}
      </li>
      <li>
        <button type="button" className="mk-cab-fnbtn" onClick={() => setDemoOk((v) => !v)}>
          {demoOk ? "Показать пример с расхождением" : "Показать, как выглядит пройденная сверка"}
        </button>
      </li>
    </>
  );
}

function OfdAlerts() {
  const q = quarantineSummary(DEMO_QUAR, DEMO_NOW);
  const u = unsentState(DEMO_UNSENT.count, DEMO_UNSENT.oldest, DEMO_NOW);
  const sub = ofdSubState(DEMO_OFD_UNTIL, DEMO_NOW);
  return (
    <>
      <ReconAlert />
      {q.count > 0 && (
        <li data-tone="bad">
          Налоговая отправила в карантин чеков: {q.count} ({q.reasons.map((r) => QUARANTINE_INFO[r].title.split(":")[0]!.toLowerCase()).join(", ")}). Мастер уже разбирается{q.needCall ? " и позвонит вам" : ""}.
        </li>
      )}
      {DEMO_UNSENT.count > 0 && (
        <li data-tone={u.tone === "ok" ? undefined : u.tone}>
          Не отправлено в ОФД чеков: {DEMO_UNSENT.count}. До блокировки накопителя {u.daysToBlock} дн. — проверьте интернет на точке.
        </li>
      )}
      {sub.offerRenewal && (
        <li data-tone={sub.tone}>
          {sub.daysLeft > 0 ? `Подписка ОФД заканчивается через ${sub.daysLeft} дн.` : "Подписка ОФД закончилась."} Продление: {OFD_PACKS.map((p) => `${p.months} мес. — ${p.price.toLocaleString("ru-RU")} ₽`).join(", ")}.
        </li>
      )}
      {q.count === 0 && DEMO_UNSENT.count === 0 && !sub.offerRenewal && <li data-tone="ok">Чеки уходят в налоговую штатно</li>}
    </>
  );
}
