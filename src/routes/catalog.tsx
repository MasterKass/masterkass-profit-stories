import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock, MessageCircle, Package, QrCode, ScanLine, Smartphone } from "lucide-react";
import { BackHome } from "@/components/back-home";
import { SiteFooter } from "@/components/home-sections";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Кассы и оборудование · Мастер Касс" },
      { name: "description", content: "Каталог касс и оборудования Мастер Касс: смарт-терминалы Эвотор, фискальные накопители, сканеры. Страница оформляется — пока подскажем подбор у инженера." },
      { property: "og:title", content: "Кассы и оборудование · Мастер Касс" },
      { property: "og:description", content: "Смарт-терминалы Эвотор, фискальные накопители и сканеры. Страница оформляется." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CatalogPage,
});

const groups = [
  {
    icon: Smartphone,
    t: "Смарт-терминалы Эвотор",
    d: "От мобильного Эвотор 5i для выездной торговли до Эвотор 7.2, 7.3, 10 и Power — для точки с потоком гостей и большим экраном кассира.",
    soon: "Фото, характеристики и цены моделей появятся на странице.",
  },
  {
    icon: Package,
    t: "Фискальные накопители",
    d: "ФН на 15 и 36 месяцев под ваш режим работы. Следим за сроком и готовим замену заранее, чтобы касса не встала в рабочую смену.",
    soon: "Сроки, стоимость и порядок замены оформим в каталоге.",
  },
  {
    icon: ScanLine,
    t: "Сканеры и весы",
    d: "Сканеры штрихкодов и весы для розницы, общепита и маркировки — подключаем к кассе и проверяем, чтобы очередь не стояла.",
    soon: "Список моделей и совместимость с вашими программами уточним при подборе.",
  },
  {
    icon: QrCode,
    t: "Оборудование для маркировки",
    d: "Всё, что нужно для работы с кодами маркировки и документов: от сканирования кода до отчётов в систему прослеживаемости.",
    soon: "Разбор по товарным группам готовим отдельно.",
  },
];

const incoming = [
  "Фотографии, характеристики и цены по каждой модели.",
  "Наличие на складе и сроки доставки в Ростов-на-Дону и по югу России.",
  "Подбор под задачу: кофейня, магазин одежды, салон, выездная торговля.",
  "Установка и перерегистрация кассы инженером под ключ.",
];

function CatalogPage() {
  return (
    <div className="mk-page min-h-screen">
      <BackHome showLogin />
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-10">
        <section className="mt-12 max-w-3xl">
          <span className="mk-soon"><Clock size={13} aria-hidden="true" />Страница оформляется</span>
          <h1 className="mt-6 text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] md:text-6xl">
            <span className="mk-bonus-title">Кассы и оборудование</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed" style={{ color: "var(--mk-muted)" }}>
            Собираем в этом разделе кассы и всё, что нужно для их работы. Пока страница наполняется, инженер
            подберёт оборудование под вашу точку и назовёт точную стоимость — с учётом того, что уже стоит на кассовом узле.
          </p>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-2">
          {groups.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.t} className="mk-card">
                <span className="mk-cab-ico"><Icon size={18} aria-hidden="true" /></span>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{g.t}</h2>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--mk-muted)" }}>{g.d}</p>
                <p className="mk-cab-muted mt-4">{g.soon}</p>
              </div>
            );
          })}
        </section>

        <section className="mk-card mk-pillar-wide mt-16">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">Что появится на странице</h2>
          </div>
          <ul className="mt-3 space-y-3 text-[15px] leading-relaxed md:mt-0" style={{ color: "var(--mk-muted)" }}>
            {incoming.map((x) => (
              <li key={x} className="flex items-start gap-2.5">
                <span aria-hidden className="mt-[0.55em] size-[5px] shrink-0 rounded-full" style={{ background: "var(--mk-fg)" }} />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 flex flex-wrap items-center gap-3">
          <Link to="/support" className="mk-outline"><MessageCircle />Спросить инженера<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          <Link to="/onboarding" search={{ tariff: undefined, ref: undefined }} className="mk-outline">Начать бесплатный период</Link>
        </section>
      </main>
      <div className="px-4 pb-6"><SiteFooter /></div>
    </div>
  );
}
