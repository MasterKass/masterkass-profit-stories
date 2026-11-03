import { createFileRoute, Link } from "@tanstack/react-router";
import { BackHome } from "@/components/back-home";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Партнёрская программа · Мастер Касс" },
      { name: "description", content: "Партнёрская программа Мастер Касс для бухгалтеров и юристов, вебмастеров и наших клиентов: 2 000 ₽ за клиента, выплаты по ссылке и AI-юниты за приглашение." },
      { property: "og:title", content: "Партнёрская программа · Мастер Касс" },
      { property: "og:description", content: "Рекомендуйте надёжный кассовый сервис и получайте вознаграждение." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Partners,
});

const TYPES = [
  {
    tone: "cyan",
    tag: "Специалистам",
    title: "Бухгалтеры, юристы, 1С-специалисты",
    reward: "2 000 ₽",
    rewardNote: "за каждого клиента, на любом тарифе",
    items: [
      "Одна выплата сразу после первой оплаты подписки клиентом",
      "Сумма одинаковая для «Просто», «Учёт» и «Контроль»",
      "Ваши клиенты получают первый месяц бесплатно",
      "Кассы, ОФД и сроки накопителей больше не ваша забота",
    ],
    cta: "Стать партнёром",
  },
  {
    tone: "lime",
    tag: "Вебмастерам",
    title: "Реклама и привлечение по ссылке",
    reward: "2 000 ₽",
    rewardNote: "за клиента, оплатившего подписку",
    items: [
      "Персональная ссылка и метка для ваших рекламных кампаний",
      "Платим за оплаченных клиентов, а не за клики и заявки",
      "Статистика переходов, регистраций и оплат в кабинете",
      "Материалы для рекламы предоставим",
    ],
    cta: "Получить ссылку",
  },
  {
    tone: "amber",
    tag: "Клиентам",
    title: "Пригласите коллегу или соседа",
    reward: "500 юнитов",
    rewardNote: "или скидка 500 ₽ на следующий месяц",
    items: [
      "Другу: первый месяц бесплатно и 300 AI-юнитов на старте",
      "Вам: бонус после первой оплаты приглашённого",
      "Ссылка и QR-код в кабинете директора",
      "Отправить можно в мессенджер в одно касание",
    ],
    cta: "Пригласить",
  },
];

const STEPS = [
  { n: "01", t: "Получаете ссылку", d: "Регистрируетесь как партнёр и получаете персональную ссылку и промокод." },
  { n: "02", t: "Клиент пробует бесплатно", d: "Приглашённый подключается и месяц пользуется сервисом со всеми функциями." },
  { n: "03", t: "Первая оплата", d: "Клиент оплачивает подписку. Вознаграждение сразу начисляется вам." },
  { n: "04", t: "Выплата", d: "Самозанятым по чеку из «Мой налог», ИП и компаниям по акту. Клиентам бонус приходит на баланс." },
];

function Partners() {
  return (
    <main className="mk-page min-h-screen">
      <BackHome />
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-24">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Партнёрская программа</h1>
        <p className="mt-5 max-w-2xl text-lg" style={{ color: "var(--mk-muted)" }}>
          Рекомендуйте надёжный кассовый сервис тем, кому доверяете. Основа программы: крепкие связи и доверие друг другу.
        </p>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {TYPES.map((t) => (
            <div key={t.tag} className={`mk-card mk-tariff mk-tariff-${t.tone}`}>
              <span className="mk-tariff-free"><b>{t.tag}</b></span>
              <h2 className="text-xl font-semibold" style={{ color: "var(--mk-tariff-deep)" }}>{t.title}</h2>
              <p className="mt-6 text-4xl font-semibold tracking-[-0.03em]">{t.reward}</p>
              <p className="mt-1 text-sm" style={{ color: "var(--mk-muted)" }}>{t.rewardNote}</p>
              <ul className="mt-6 space-y-2 text-[14px]">
                {t.items.map((i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-[0.55em] size-[5px] shrink-0 rounded-full" style={{ background: "var(--mk-tariff-deep)" }} />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <button type="button" className="mk-tariff-cta w-full" title="Кабинет партнёра скоро заработает">{t.cta}</button>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-24">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">Как это работает</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="mk-card">
                <span className="text-xs font-medium tracking-widest" style={{ color: "var(--mk-muted)" }}>{s.n}</span>
                <h3 className="mt-5 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--mk-muted)" }}>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 mk-card">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">Договор и документы</h2>
          <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--mk-muted)" }}>
            Работаем по партнёрскому соглашению, которое принимается при регистрации. Выплаты проводим самозанятым, ИП и компаниям. Вознаграждение начисляется только за клиентов, которые оплатили подписку после бесплатного месяца.
          </p>
          <div className="mt-6">
            <Link to="/service" hash="tariffs" className="mk-outline">Посмотреть тарифы</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
