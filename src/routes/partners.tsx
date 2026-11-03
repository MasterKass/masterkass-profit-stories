import { createFileRoute } from "@tanstack/react-router";
import { BackHome } from "@/components/back-home";
import { PartnerLeadForm } from "@/components/partner-lead-form";

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
  "Регистрация и подписание договора",
  "Ссылка и QR-код",
  "Клиент вносит первую оплату",
  "Вознаграждение видно в кабинете",
  "Вывод на карту",
  "Закрывающие документы при необходимости",
];

const HUES = ["#f5a524", "#f7c948", "#b5d84a", "#5fd6a0", "#3fc8d8", "#6bb8f0"];
const ROW_H = 100;

function mix(a: string, b: string) {
  const ch = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
  const c = (x: number, y: number) => Math.round((x + y) / 2).toString(16).padStart(2, "0");
  return `#${c(ch(a, 1), ch(b, 1))}${c(ch(a, 3), ch(b, 3))}${c(ch(a, 5), ch(b, 5))}`;
}

const hueAt = (i: number) => HUES[i % HUES.length] ?? "#f5a524";



function StepsSnake() {
  const n = STEPS.length;
  const xs = STEPS.map((_, i) => (i % 2 === 0 ? 12 : 88));
  const ys = STEPS.map((_, i) => i * ROW_H + ROW_H / 2);
  const k = ROW_H * 0.9;
  let d = `M ${xs[0] ?? 0} ${ys[0] ?? 0}`;
  for (let i = 0; i < n - 1; i++) {
    d += ` C ${xs[i] ?? 0} ${(ys[i] ?? 0) + k}, ${xs[i + 1] ?? 0} ${(ys[i + 1] ?? 0) - k}, ${xs[i + 1] ?? 0} ${ys[i + 1] ?? 0}`;

  }

  return (
    <div className="mk-snake mx-auto mt-10 max-w-2xl" style={{ height: `calc(${n} * var(--mk-step-h))` }}>
      <svg className="mk-snake-line" viewBox={`0 0 100 ${n * ROW_H}`} preserveAspectRatio="none" fill="none" aria-hidden>
        <defs>
          <linearGradient id="mk-snake-grad" x1="0" y1="0" x2="0" y2="1">
            {HUES.map((h, i) => (
              <stop key={h} offset={`${(i / (n - 1)) * 100}%`} stopColor={h} />
            ))}
          </linearGradient>
        </defs>
        <path d={d} stroke="url(#mk-snake-grad)" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>

      {STEPS.slice(1).map((_, i) => {
        const j = i + 1;
        const right = i % 2 === 0;
        return (
          <span key={`arrow-${j}`} className="mk-snake-arrow" aria-hidden
            style={{ top: `calc(${j} * var(--mk-step-h))`, color: mix(hueAt(j - 1), hueAt(j)), transform: `translate(-50%, -50%)${right ? "" : " scaleX(-1)"}` }}>
            <svg viewBox="0 0 12 10" width="12" height="10" fill="none">
              <path d="M2 1.5 L7 5 L2 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        );
      })}

      {STEPS.map((t, i) => {
        const left = i % 2 === 0;
        const hue = hueAt(i);
        return (
          <div key={t} className={`mk-step ${left ? "mk-step-left" : "mk-step-right"}`}>
            <span className="mk-step-dot" aria-hidden style={{ background: hue, boxShadow: `0 0 0 5px ${hue}1f` }} />
            <span className="mk-step-text">{t}</span>
          </div>
        );
      })}
    </div>
  );
}



function Partners() {
  return (
    <main className="mk-page mk-dark-page min-h-screen">
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
                <a href="#partner-guide" className="mk-tariff-cta w-full">{t.cta}</a>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-24">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">Как это работает</h2>
          <StepsSnake />
        </section>


        <section className="mt-24 mk-card">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">Договор и документы</h2>
          <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--mk-muted)" }}>
            Работаем по партнёрскому соглашению, которое принимается при регистрации. Выплаты проводим самозанятым, ИП и компаниям. Вознаграждение начисляется только за клиентов, которые оплатили подписку после бесплатного месяца.
          </p>
        </section>

        <div className="mt-24">
          <PartnerLeadForm />
        </div>
      </div>
    </main>
  );
}
