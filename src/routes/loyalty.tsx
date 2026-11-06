import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/home-sections";
import { BackHome } from "@/components/back-home";
import { RequestForm } from "@/components/request-form";

export const Route = createFileRoute("/loyalty")({
  head: () => ({
    meta: [
      { title: "Система лояльности · Мастер Касс" },
      { name: "description", content: "Встроенная система лояльности на кассе Эвотор: электронные карты в Wallet, push-уведомления, аналитика возвратности и ИИ-помощник." },
      { property: "og:title", content: "Система лояльности · Мастер Касс" },
      { property: "og:description", content: "Окупите затраты на автоматизацию за счёт встроенной системы лояльности." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoyaltyPage,
});

const blocks: { n: string; t: string; items: string[] }[] = [
  { n: "01", t: "Для гостя", items: [
    "Без пластиковых карт и лишних приложений: электронная карта сохраняется в *Apple Wallet* или *Google Wallet* за пару секунд *по QR-коду*.",
    "Бесплатные *push-уведомления* вместо дорогих SMS: напоминания о бонусах, поздравления и новости приходят *прямо на экран смартфона*.",
    "Баланс и условия сгорания баллов *всегда видны* на обороте карты.",
    "Если телефона нет под рукой, кассир найдёт гостя *по номеру* за несколько секунд.",
  ] },
  { n: "02", t: "На кассе", items: [
    "Работает *прямо на кассе Эвотор*: не нужно переключаться между окнами и вводить данные вручную.",
    "Утром ИИ-наставник подсказывает кассиру *фразу дня*: кому предложить списать баллы, кого пригласить в клуб постоянных гостей.",
    "Поиск гостя и расчёт скидки проходят до закрытия чека, *очередь не стоит*.",
  ] },
  { n: "03", t: "В кабинете директора", items: [
    "*Возвратность*: сколько гостей пришли во второй, третий и пятый раз.",
    "*Сравнение* среднего чека участника программы и обычного покупателя.",
    "«Спящие» гости, которые не заходили больше 30 дней, с готовым предложением, как напомнить о себе.",
    "Выручка от повторных визитов за вычетом выданных бонусов.",
    "*Стратегия* удержания и привлечения новых клиентов, встроенная партнёрская программа «Приведи друга».",
  ] },
  { n: "04", t: "ИИ-помощник", items: [
    "*Анализирует* чеки вашей точки и предлагает механику: кешбэк, приветственные баллы или «счастливые часы».",
    "*Проверяет гипотезу* на ваших цифрах до запуска акции.",
    "*Вовремя подсказывает*: «У 42 постоянных гостей в субботу сгорают баллы. Отправим напоминание?»",
  ] },
  { n: "05", t: "Честные условия", items: [
    "Входит во все тарифы МастерКасс.",
    "*Без платы* за количество карт в базе.",
  ] },
];

function LoyaltyPage() {
  return (
    <div className="mk-page min-h-screen">
      <BackHome showLogin />
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-10">
        <section className="mt-12 max-w-3xl">
          <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] md:text-6xl"><span className="mk-bonus-title">МК Бонус</span></h1>
          <p className="mt-3 text-lg md:text-xl" style={{ color: "var(--mk-muted)" }}>Система лояльности клиентов</p>
          <p className="mt-6 text-lg leading-relaxed" style={{ color: "var(--mk-muted)" }}>
            Мы встроили программу прямо в сервис: она работает на вашей кассе, помогает удерживать и возвращать клиентов.
          </p>
        </section>
        <section className="mt-16 grid gap-4 md:grid-cols-2">
          {blocks.map((b, i) => (
            <div key={b.n} className={`mk-card${i === blocks.length - 1 ? " md:col-span-2" : ""}`}>
              <span className="text-xs font-medium tracking-widest" style={{ color: "var(--mk-muted)" }}>{b.n}</span>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{b.t}</h2>
              <ul className="mt-4 space-y-3 text-[15px] leading-relaxed" style={{ color: "var(--mk-muted)" }}>
                {b.items.map((x) => <li key={x}>{x.split("*").map((part, k) => k % 2 ? <b key={k} className="mk-hl">{part}</b> : part)}</li>)}
              </ul>
            </div>
          ))}
        </section>
        <div className="mt-16 md:mt-20"><RequestForm /></div>
      </main>
      <div className="px-4 pb-6"><SiteFooter /></div>
    </div>
  );
}
