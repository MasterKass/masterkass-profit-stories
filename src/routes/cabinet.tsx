import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronDown, Wallet, HeartHandshake, FileSignature, Package, Users, MonitorSmartphone, Landmark, Mic, Sparkles, FileText, Download, X,
} from "lucide-react";
import { BackHome } from "@/components/back-home";
import { BrandMark } from "@/components/brand-mark";
import { useQuery } from "@tanstack/react-query";
import { getEvotorCabinet } from "@/lib/evotor.functions";
import { fnNeedsAlert } from "@/lib/evotor";

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
  { id: "loyalty", title: "Маркетинг и лояльность", icon: HeartHandshake, summary: "186 постоянных гостей · +14 карт за неделю", rows: [
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
    ["Касса №1", "Эвотор 7.2 · в сети"], ["Фискальный накопитель", "действует ещё 45 дней"], ["Износ кассы", "38% · замена через фонд"],
  ] },
  { id: "news", title: "Новости госрегулирования", icon: Landmark, summary: "Разрешительный режим: касса обновлена", rows: [
    ["Маркировка молочной продукции", "проверено, ошибок нет"], ["Разрешительный режим", "касса готова"], ["Новые форматы ФФД", "обновление не требуется"],
  ] },
];

function Cabinet() {
  const [open, setOpen] = useState<string | null>("finance");
  const [digest, setDigest] = useState(false);
  const { data: live, isLoading } = useQuery({ queryKey: ["evotor-cabinet"], queryFn: () => getEvotorCabinet(), staleTime: 60_000 });
  useEffect(() => {
    if (!digest) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDigest(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [digest]);
  return (
    <main className="mk-page mk-cab min-h-screen">
      <BackHome />
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-24">
        <header className="mk-cab-head">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <p className="mk-cab-org">Кофейня «Утро»</p>
              <p className="mk-cab-muted">Директор · демо-данные</p>
            </div>
          </div>
          <span className="mk-cab-units"><Sparkles size={14} aria-hidden="true" />1 300 AI-юнитов</span>
        </header>

        {live?.ok ? (
          <section className="mk-card mk-cab-pulse" aria-label="Касса Эвотор">
            <p className="mk-cab-kicker">Живые данные кассы · {live.store}</p>
            <p className="mk-cab-big">{rub(live.summary.revenue)}</p>
            <p className="mk-cab-muted">
              {live.summary.day ? `Выручка за ${fmtDay(live.summary.day)}` : "Продаж за 14 дней нет"}
              {live.summary.refunds ? ` · возвратов: ${live.summary.refunds}` : ""}
            </p>
            <dl className="mk-cab-stats">
              <div><dt>Чеков</dt><dd>{live.summary.receipts}</dd></div>
              <div><dt>Средний чек</dt><dd>{rub(live.summary.avgCheck)}</dd></div>
              <div><dt>Наличные / карта</dt><dd>{rub(live.summary.cash)} / {rub(live.summary.card)}</dd></div>
            </dl>
            <dl className="mk-cab-rows">
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
            </dl>
          </section>
        ) : (
          <section className="mk-card mk-cab-pulse" aria-label="Сегодня на точке">
            <p className="mk-cab-kicker">{isLoading ? "Загружаем данные кассы…" : "Сегодня на точке · демо"}</p>
            <p className="mk-cab-big">48 650 ₽</p>
            <p className="mk-cab-up">{live && !live.ok ? live.error : "+12% к прошлому вторнику"}</p>
            <dl className="mk-cab-stats">
              <div><dt>Чеков</dt><dd>73</dd></div>
              <div><dt>Средний чек</dt><dd>665 ₽</dd></div>
              <div><dt>Смена</dt><dd>Анна К., с 08:00</dd></div>
            </dl>
          </section>
        )}

        <section className="mk-card mk-cab-attn" aria-label="Требует внимания">
          <p className="mk-cab-kicker">Требует внимания</p>
          <ul>
            {live?.fn && <FnAlert fn={live.fn} />}
            <li data-tone="warn">ЭДО: накладная «Кофе-Опт» на 24 500 ₽ ждёт подписи</li>
            <li data-tone="warn">Сироп ваниль заканчивается: остался 1 шт</li>
            <li data-tone="ok">Маркировка проверена, ошибок нет</li>
          </ul>
        </section>

        <button type="button" className="mk-cab-ask"><Mic size={16} aria-hidden="true" />Спросить AI: «Сравни выручку этой недели с прошлой»</button>

        <button type="button" onClick={() => setDigest(true)} className="mk-cab-ask mk-cab-dl">
          <FileText size={16} aria-hidden="true" />Дайджест за 3 ноября: открыть и скачать
        </button>

        {digest && (
          <div className="mk-dv" role="dialog" aria-modal="true" aria-label="Дайджест за 3 ноября">
            <div className="mk-dv-bar">
              <button type="button" onClick={() => setDigest(false)} aria-label="Закрыть"><X size={18} aria-hidden="true" />Закрыть</button>
              <a href="/downloads/digest-utro.pdf" target="_blank" rel="noopener" className="mk-dv-save"><Download size={16} aria-hidden="true" />Скачать PDF</a>
            </div>
            <div className="mk-dv-body">
              <img src="/downloads/digest-utro.png" alt="Утренний дайджест: кофейня «Утро», 3 ноября" />
            </div>
          </div>
        )}

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
                    <span className="mk-cab-muted">{s.summary}</span>
                  </span>
                  <ChevronDown size={18} className="mk-cab-chev" data-open={isOpen} aria-hidden="true" />
                </button>
                {isOpen && (
                  <dl className="mk-cab-rows">
                    {s.rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                  </dl>
                )}
              </section>
            );
          })}
        </div>
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
