import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteFooter, AskAi } from "@/components/home-sections";
import { DayComic } from "@/components/day-comic";

export const Route = createFileRoute("/service")({
  head: () => ({
    meta: [
      { title: "Как устроен сервис — Мастер Касс" },
      { name: "description", content: "Мы не создаём программы, мы помогаем внедрить их в вашу работу: AI-сотрудник 24/7, единое окно поддержки, лояльность, три тарифа и новая касса каждые 3 года." },
      { property: "og:title", content: "Как устроен сервис Мастер Касс" },
      { property: "og:description", content: "Единое окно для кассы, программ и поддержки. Первый месяц бесплатно." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServicePage,
});

const pillars = [
  { n: "01", t: "Инженерный мост", d: "Сами диагностируем проблему, говорим с поддержкой приложений, банков и ОФД на их языке — и переводим ответ кассиру в простую инструкцию." },
  { n: "02", t: "AI-сотрудник 24/7", d: "Голосом и текстом: разбор ошибок, зависших чеков и блокировок. Вводит нового кассира за одну смену и подсказывает при любых изменениях законов." },
  { n: "03", t: "Цифровой паспорт точки", d: "Касса, сканер, весы, срок ФН, подключённые программы и подписки — в одном окне. Календарь платежей без внезапных блокировок." },
  { n: "04", t: "Лояльность, которая окупает сервис", d: "Помогаем настроить бонусы, проверяем гипотезы и анализируем возврат гостей. Повторные продажи перекрывают стоимость обслуживания." },
];

const tariffs = [
  { name: "Просто", price: "1 950", who: "Услуги, студии, абонементы — до 10 позиций.", items: ["Мониторинг ФН и ОФД 24/7", "AI-помощник и инженер", "Базовая лояльность", "Утренний дайджест"] },
  { name: "Учёт", price: "3 850", who: "Магазины, кофейни, пекарни — широкий ассортимент.", items: ["Помощь в настройке и ведении товароучёта", "Техкарты и инвентаризации", "Настройка лояльности и анализ", "Расширенный дайджест"] },
  { name: "Контроль", price: "5 650", who: "Бизнес с госсистемами — маркеты, общепит, лавки.", items: ["Всё из тарифа «Учёт»", "Честный Знак, Меркурий, ЕГАИС", "ЭДО и ЭЦП под контролем", "Приоритетная аварийная линия"] },
];

function ServicePage() {
  return (
    <div className="mk-page min-h-screen">
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--mk-muted)" }}>
          <ArrowLeft className="h-4 w-4" />На главную
        </Link>

        <DayComic />
        <section className="mt-12 max-w-3xl">
          <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] md:text-6xl">Как устроен сервис</h1>
          <p className="mt-6 text-lg leading-relaxed" style={{ color: "var(--mk-muted)" }}>
            Мы не создаём программы, мы помогаем внедрить их в вашу работу. Берём на себя настройку, обучаем сотрудников и говорим с разработчиками от лица вашего бизнеса. Всё в одном окне, а аналитика — на понятном языке.
          </p>
        </section>

        <section className="mt-20 grid gap-4 md:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.n} className="mk-card">
              <span className="text-xs font-medium tracking-widest" style={{ color: "var(--mk-muted)" }}>{p.n}</span>
              <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">{p.t}</h2>
              <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--mk-muted)" }}>{p.d}</p>
            </div>
          ))}
        </section>

        <section className="mt-24">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">Три тарифа</h2>
          <p className="mt-3 text-[15px]" style={{ color: "var(--mk-muted)" }}>Первый месяц — бесплатно, со всеми функциями.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {tariffs.map((t) => (
              <div key={t.name} className="mk-card flex flex-col">
                <h3 className="text-xl font-semibold">{t.name}</h3>
                <p className="mt-2 text-sm" style={{ color: "var(--mk-muted)" }}>{t.who}</p>
                <p className="mt-6 text-4xl font-semibold tracking-[-0.03em]">{t.price} <span className="text-base font-medium">₽/мес</span></p>
                <ul className="mt-6 space-y-2 text-[14px]">
                  {t.items.map((i) => <li key={i}>— {i}</li>)}
                </ul>
                <p className="mt-6 text-xs" style={{ color: "var(--mk-muted)" }}>Включая 750 ₽ в фонд новой кассы</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 grid gap-4 md:grid-cols-2">
          <div className="mk-card">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">Новая касса каждые 3 года</h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--mk-muted)" }}>
              750 ₽ из каждого платежа уходят в ваш фонд. За 36 месяцев накапливается 27 000 ₽ — и вы получаете новый аппарат с переносом баз и перерегистрацией под ключ.
            </p>
          </div>
          <div className="mk-card">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">Утренний дайджест</h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--mk-muted)" }}>
              Каждое утро на почту — аккуратный PDF: выручка, средний чек, эффект акций и календарь ближайших платежей за программы кассы.
            </p>
          </div>
        </section>


        <AskAi title="Задайте вопрос и менеджеру" prompt="Что входит в тариф «Учёт»? Расскажи подробнее" />
      </main>
      <div className="px-4 pb-6"><SiteFooter /></div>
    </div>
  );
}
