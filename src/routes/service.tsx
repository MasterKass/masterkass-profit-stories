import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, AskAi } from "@/components/home-sections";
import { DayComic } from "@/components/day-comic";
import { BackHome } from "@/components/back-home";
import { RequestForm } from "@/components/request-form";
import {
  AI_UNIT_PRICE,
  AI_UNIT_SIZE,
  AMORTIZATION_FUND,
  CASHIER_FREE_NOTE,
  FIRST_MONTH_BADGE,
  FIRST_MONTH_BADGE_NOTE,
  FIRST_MONTH_NOTE,
  SERVICE_TARIFFS,
  TOPUP_PACKAGES,
  unitsLabel,
} from "@/lib/tariffs";

export const Route = createFileRoute("/service")({
  head: () => ({
    meta: [
      { title: "Как устроен сервис · Мастер Касс" },
      { name: "description", content: "Мы помогаем внедрить программы в вашу работу: ИИ-сотрудник 24/7, единое окно поддержки, лояльность, три тарифа и новая касса каждые 3 года." },
      { property: "og:title", content: "Как устроен сервис Мастер Касс" },
      { property: "og:description", content: "Единое окно для кассы, программ и поддержки. Первый месяц бесплатно." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServicePage,
});

const pillars = [
  { n: "01", t: "ИИ-сотрудник 24/7", d: "Голосом и текстом: разбор ошибок, зависших чеков и блокировок. Вводит нового кассира за одну смену и подсказывает при любых изменениях законов." },
  { n: "02", t: "Цифровой паспорт точки", d: "Касса, сканер, весы, срок ФН, подключённые программы и подписки в одном окне. Календарь платежей без внезапных блокировок." },
  { n: "03", t: "Инженерный мост", d: "Сами диагностируем проблему, говорим с поддержкой приложений, банков и ОФД на их языке и переводим ответ кассиру в простую инструкцию.", wide: true },
  { n: "04", t: "Утренний дайджест", d: "Каждое утро на почту приходит аккуратный PDF: выручка, средний чек, эффект акций и календарь ближайших платежей за программы кассы.", wide: true },
  { n: "05", t: "Новая касса каждые 3 года", d: "750 ₽ из каждого платежа уходят в ваш фонд. За 36 месяцев накапливается 27 000 ₽, и вы получаете новый аппарат с переносом баз и перерегистрацией под ключ.", wide: true },
];

const tariffs = SERVICE_TARIFFS;

function ServicePage() {
  const topups = TOPUP_PACKAGES.map((p) => `${unitsLabel(p.units)} за ${p.price} ₽`).join(", ");

  return (
    <div className="mk-page min-h-screen">
      <BackHome showLogin />
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-10">

        <section className="mt-12 max-w-3xl">
          <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] md:text-6xl">Как устроен сервис</h1>
          <p className="mt-6 text-lg leading-relaxed" style={{ color: "var(--mk-muted)" }}>
            Мы помогаем внедрить программы в вашу работу. Берём на себя настройку, обучаем сотрудников и говорим с разработчиками от лица вашего бизнеса. Всё в одном окне, а аналитика говорит на понятном языке.
          </p>
        </section>

        <section className="mt-20 grid gap-4 md:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.n} className={`mk-card${p.wide ? " mk-pillar-wide" : ""}${p.wide ? " md:col-span-2" : ""}`}>
              <div>
                <span className="text-xs font-medium tracking-widest" style={{ color: "var(--mk-muted)" }}>{p.n}</span>
                <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">{p.t}</h2>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--mk-muted)" }}>{p.d}</p>
            </div>
          ))}
        </section>


        <section className="mt-24">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">Три тарифа</h2>
          <p className="mt-3 text-[15px]" style={{ color: "var(--mk-muted)" }}>{FIRST_MONTH_NOTE}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {tariffs.map((t) => (
              <div key={t.name} className={`mk-card mk-tariff mk-tariff-${t.tone} flex flex-col`}>
                <span className="mk-tariff-free">
                  <b>{FIRST_MONTH_BADGE}</b>
                  <span>{FIRST_MONTH_BADGE_NOTE}</span>
                </span>
                <h3 className="text-xl font-semibold">{t.name}</h3>
                <p className="mt-2 text-sm" style={{ color: "var(--mk-muted)" }}>{t.who}</p>
                <p className="mt-6 text-4xl font-semibold tracking-[-0.03em]">{t.price} <span className="text-base font-medium">₽/мес</span></p>
                <div className="mk-tariff-units">
                  <b>{unitsLabel(t.units)} AI-юнитов в месяц</b>
                  <span>{t.unitsNote}</span>
                </div>
                <ul className="mt-6 space-y-2 text-[14px]">
                  {t.items.map((i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span aria-hidden className="mt-[0.55em] size-[5px] shrink-0 rounded-full" style={{ background: "var(--mk-tariff-deep)" }} />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <Link to="/onboarding" search={{ tariff: t.tone }} className="mk-tariff-cta">Начать бесплатно</Link>
                  <p className="mt-4 text-xs" style={{ color: "var(--mk-muted)" }}>{CASHIER_FREE_NOTE}</p>
                  <p className="mt-1.5 text-xs" style={{ color: "var(--mk-muted)" }}>Включая {AMORTIZATION_FUND}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mk-units-note">
            <span className="mk-units-note-title">Как считаются AI-юниты</span>
            <p>
              1 юнит равен {unitsLabel(AI_UNIT_SIZE)} токенов, это примерно один разговор с помощником. Цена {AI_UNIT_PRICE}. Тарифные юниты обновляются 1-го числа, неиспользованные за месяц сгорают. Купленные пакеты не сгорают и переходят на следующий месяц: {topups}. Баланс и историю списаний покажем в личном кабинете.
            </p>
          </div>
        </section>

        <section className="mt-24">
          <div className="mk-card mk-pillar-wide">
            <div>
              <span className="text-xs font-medium tracking-widest" style={{ color: "var(--mk-muted)" }}>Лояльность</span>
              <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">Лояльность, которая окупает сервис</h2>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--mk-muted)" }}>
              Помогаем настроить бонусы, проверяем гипотезы и анализируем возврат гостей. Повторные продажи перекрывают стоимость обслуживания.
            </p>
          </div>
        </section>


        <AskAi title={"Задайте вопрос\nИИ-менеджеру"} prompt={"Что входит в тариф «Учёт»?\nРасскажи подробнее"} />

        <section className="mt-24">
          <DayComic />
        </section>

        <div className="mt-16 md:mt-20">
          <RequestForm />
        </div>
      </main>
      <div className="px-4 pb-6"><SiteFooter /></div>
    </div>
  );
}
