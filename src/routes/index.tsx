import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Check, GraduationCap, Headphones, Phone, ShieldCheck, Wrench, Sparkles, Send, LogIn, LayoutDashboard, MessageCircle } from "lucide-react";
import { WelcomeHero } from "@/components/welcome-hero";
import { Button } from "@/components/ui/button";
import coffee from "@/assets/niche-coffee.jpg";
import shop from "@/assets/niche-shop.jpg";
import market from "@/assets/niche-market.jpg";
import { REGISTER_TIERS, TARIFFS, discountFor, pricePerRegister } from "@/lib/pricing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Мастер Касс — сервис и поддержка касс Эвотор 24/7" },
      { name: "description", content: "Заботимся о ваших технологиях, пока вы заботитесь о своих клиентах. ФН, ОФД, маркировка, ЕГАИС и обучение кассиров." },
      { property: "og:title", content: "Мастер Касс — сервис касс Эвотор 24/7" },
      { property: "og:description", content: "Сервисный партнёр малого бизнеса: кассы, маркировка, ЕГАИС, AI-наставник для кассиров." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <WelcomeHero />
      <Niches />
      <Ecosystem />
      <Pricing />
      <Assistant />
      <Manifest />
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="mb-3 flex flex-wrap justify-center gap-5">
          <button type="button" title="Раздел в разработке" className="underline-offset-4 hover:underline">Политика конфиденциальности</button>
          <button type="button" title="Раздел в разработке" className="underline-offset-4 hover:underline">Публичная оферта</button>
        </div>
        © Мастер Касс · Официальный партнёр Эвотор с 2017 года
      </footer>
    </div>
  );
}

function Header() {
  return (
    <header className="welcome-header sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-8">
        <span className="font-sans text-lg font-bold">Мастер Касс<span className="welcome-brand-dot" aria-hidden="true">.</span></span>
        <Button type="button" variant="outline" title="Раздел в разработке" className="welcome-login"><LogIn />Войти</Button>
      </div>
    </header>
  );
}

const NICHES = [
  { id: "coffee", label: "☕ Кофейни и пекарни", img: coffee, spots: [
    { x: 30, y: 55, t: "Быстрый чек", d: "Модификаторы: молоко, сироп, размер — в одно касание." },
    { x: 55, y: 70, t: "Оплата картой и СБП", d: "Терминал и касса работают как одно целое." },
    { x: 80, y: 50, t: "Учёт выпечки", d: "Остатки и списания видны в телефоне владельца." },
  ]},
  { id: "shop", label: "👗 Магазины и шоурумы", img: shop, spots: [
    { x: 74, y: 55, t: "Касса с каталогом", d: "Размеры, цвета и остатки прямо на экране." },
    { x: 88, y: 60, t: "«Честный знак»", d: "2D-сканер проверяет коды онлайн, без блокировок." },
    { x: 80, y: 25, t: "Приёмка по ЭДО", d: "Накладные от поставщиков без бумаги." },
  ]},
  { id: "market", label: "🛒 Маркеты у дома", img: market, spots: [
    { x: 52, y: 60, t: "Быстрая касса", d: "Сканер, весы и чек — без очередей." },
    { x: 80, y: 30, t: "ЕГАИС", d: "Алкоголь списывается правильно, УТМ под присмотром." },
    { x: 45, y: 35, t: "Сроки годности", d: "Касса подскажет, что пора уценить." },
  ]},
];

function Niches() {
  const [active, setActive] = useState(0);
  const [spot, setSpot] = useState<number | null>(0);
  const n = NICHES[active]!;
  return (
    <section id="niches" className="bg-muted py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="font-display text-2xl font-semibold md:text-4xl">Посмотрите, что мы можем автоматизировать в вашем деле</h2>
        <p className="mt-3 text-muted-foreground">Выберите сферу и нажмите на светящиеся точки. Можно заглянуть и к соседям.</p>
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {NICHES.map((x, i) => (
            <button key={x.id} onClick={() => { setActive(i); setSpot(0); }}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${i === active ? "bg-secondary text-secondary-foreground" : "bg-card"}`}>{x.label}</button>
          ))}
        </div>
        <div className="relative mt-6 overflow-hidden rounded-3xl shadow-soft">
          <img src={n.img} alt={n.label} loading="lazy" width={1280} height={800} className="aspect-[16/10] w-full object-cover" />
          {n.spots.map((s, i) => (
            <button key={i} aria-label={s.t} onClick={() => setSpot(i)} style={{ left: `${s.x}%`, top: `${s.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
              <span className={`relative block h-5 w-5 rounded-full border-2 border-card ${spot === i ? "bg-secondary" : "bg-primary"}`} />
            </button>
          ))}
          {spot !== null && (
            <div className="absolute bottom-4 left-4 right-4 max-w-sm rounded-2xl bg-card/95 p-4 shadow-soft backdrop-blur md:left-6">
              <div className="font-semibold">{n.spots[spot]!.t}</div>
              <div className="text-sm text-muted-foreground">{n.spots[spot]!.d}</div>
            </div>
          )}
        </div>
        <div className="mt-10 text-center">
          <button onClick={() => scrollTo("pricing")} className="rounded-full bg-primary px-7 py-3 font-semibold text-primary-foreground shadow-soft">Подобрать решение для моей точки</button>
        </div>
      </div>
    </section>
  );
}

function Ecosystem() {
  const items = [
    { i: ShieldCheck, t: "Следим за сроками", d: "ФН, ОФД и лицензии — напомним и обновим заранее." },
    { i: Headphones, t: "Поддержка 24/7", d: "Дежурные инженеры для кассиров и владельцев." },
    { i: GraduationCap, t: "Обучение команды", d: "Новый кассир освоится за 15 минут." },
    { i: Bot, t: "Бесплатный AI-наставник", d: "Подскажет, что делать, даже в 3 часа ночи." },
    { i: Wrench, t: "Работы мастера", d: "Плановые замены и настройка без скрытых счетов." },
    { i: Sparkles, t: "Автоматизация", d: "Склад, ЭДО, лояльность, маркировка, ЕГАИС." },
  ];
  return (
    <section id="service" className="mx-auto max-w-6xl px-5 py-24 md:py-32">
      <h2 className="font-display max-w-3xl text-2xl font-semibold md:text-4xl">Всё, что нужно кассовой зоне и для автоматизации бизнеса — каждый день</h2>
      <p className="mt-3 max-w-2xl text-muted-foreground">Оборудование, программы, отчётность в ФНС и обучение вашей команды — один партнёр вместо десятка разовых мастеров.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ i: Icon, t, d }) => (
          <div key={t} className="rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:shadow-soft">
            <Icon className="h-7 w-7 text-primary" />
            <div className="mt-4 font-semibold">{t}</div>
            <div className="mt-1 text-sm text-muted-foreground">{d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const [tier, setTier] = useState(0);
  const registers = REGISTER_TIERS[tier]!.min;
  const discount = discountFor(registers);
  return (
    <section id="pricing" className="bg-secondary py-16 text-secondary-foreground md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="font-display text-2xl font-semibold md:text-4xl">Тариф зависит от того, что нужно вашему делу</h2>
        <p className="mt-3 opacity-80">Чем больше госсистем — тем больше работы инженера. Чем больше касс — тем выгоднее.</p>
        <div className="mt-8 rounded-3xl bg-secondary-foreground/10 p-5">
          <div className="text-sm font-semibold">Сколько у вас касс?</div>
          <input type="range" min={0} max={3} value={tier} onChange={(e) => setTier(+e.target.value)} className="mt-4 w-full accent-[var(--primary)]" aria-label="Количество касс" />
          <div className="mt-2 grid grid-cols-4 text-center text-xs md:text-sm">
            {REGISTER_TIERS.map((t, i) => <button key={t.label} onClick={() => setTier(i)} className={i === tier ? "font-bold" : "opacity-70"}>{t.label}</button>)}
          </div>
          {discount > 0 && (
            <div className="mt-4 inline-block rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
              Растём вместе: скидка {Math.round(discount * 100)}% за развитие сети
            </div>
          )}
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TARIFFS.map((t, i) => (
            <div key={t.id} className={`flex flex-col rounded-3xl bg-card p-6 text-card-foreground ${i === 1 ? "ring-2 ring-primary" : ""}`}>
              <div className="font-display text-xl font-semibold">{t.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{t.for}</div>
              <div className="mt-5 text-sm text-muted-foreground">ориентировочно</div>
              <div className="text-3xl font-bold">от {pricePerRegister(t.base, registers).toLocaleString("ru-RU")} ₽</div>
              <div className="text-sm text-muted-foreground">в месяц за кассу</div>
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {t.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}</li>)}
              </ul>
              <button onClick={() => scrollTo("assistant")} className="mt-6 rounded-full bg-primary py-3 font-semibold text-primary-foreground">Получить точный расчёт</button>
            </div>
          ))}
        </div>
        {tier === 3 && <p className="mt-6 text-center">Для сетей от 10 касс — выделенный инженер и персональный регламент работы.</p>}
      </div>
    </section>
  );
}

const QA: Record<string, string> = {
  "Завис чек — что делать?": "Не перезагружайте кассу сразу. Откройте «Продажа» → «Отменить чек». Если не выходит — нажмите «Позвать инженера», мы подключимся удалённо за пару минут.",
  "Как сделать возврат?": "Меню → «Возврат» → найдите чек по номеру или отсканируйте QR → выберите позиции → «Вернуть». Деньги вернутся тем же способом оплаты.",
  "Когда менять ФН?": "Мы сами следим за сроком и напомним за 30 дней. Сейчас у вас всё в порядке — накопитель активен.",
};

function Assistant() {
  const [q, setQ] = useState<string | null>(null);
  return (
    <section id="assistant" className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
      <div>
        <h2 className="font-display text-2xl font-semibold md:text-4xl">AI-наставник для ваших кассиров — бесплатно</h2>
        <p className="mt-3 text-muted-foreground">Входит в каждый тариф. Отвечает в любое время, а сложные случаи сразу передаёт живому инженеру.</p>
        <LeadForm />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button type="button" title="Раздел в разработке" className="flex items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-semibold"><MessageCircle className="h-4 w-4 text-primary" />Telegram</button>
          <button type="button" title="Раздел в разработке" className="flex items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-semibold"><MessageCircle className="h-4 w-4 text-primary" />WhatsApp</button>
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-secondary-foreground"><Bot className="h-5 w-5" /></span>
          <div><div className="font-semibold">Наставник Мастер Касс</div><div className="text-xs text-muted-foreground">в сети · 24/7</div></div>
        </div>
        <div className="space-y-3 py-4 text-sm">
          <div className="max-w-[85%] rounded-2xl bg-muted p-3">Здравствуйте! Выберите вопрос — покажу, как я помогаю.</div>
          {q && <>
            <div className="ml-auto max-w-[85%] rounded-2xl bg-primary p-3 text-primary-foreground">{q}</div>
            <div className="max-w-[85%] rounded-2xl bg-muted p-3">{QA[q]}</div>
          </>}
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(QA).map((k) => <button key={k} onClick={() => setQ(k)} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">{k}</button>)}
        </div>
      </div>
    </section>
  );
}

function LeadForm() {
  const [sent, setSent] = useState(false);
  if (sent) return <div className="mt-8 rounded-2xl bg-accent p-5 font-semibold text-accent-foreground">Спасибо! Инженер свяжется с вами в течение 15 минут.</div>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-8 space-y-3">
      <input required placeholder="Ваше имя" className="w-full rounded-xl border border-border bg-card px-4 py-3" />
      <input required type="tel" placeholder="Телефон" className="w-full rounded-xl border border-border bg-card px-4 py-3" />
      <button className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-semibold text-primary-foreground"><Send className="h-4 w-4" />Получить индивидуальный расчёт</button>
    </form>
  );
}

function Manifest() {
  return (
    <section id="about" className="bg-muted py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="font-display text-2xl font-semibold md:text-4xl">Почему с нами работают годами</h2>
        <p className="mt-4 max-w-3xl text-lg">Мы усиливаем малый бизнес — людей, которые кормят, шьют, ремонтируют и обслуживают. Когда хорошо всем — это польза.</p>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[["9+", "лет рядом с бизнесом"], ["700+", "точек на обслуживании"], ["24/7", "дежурный инженер"], ["98%", "задач решаем удалённо"]].map(([n, l]) => (
            <div key={l} className="rounded-3xl bg-card p-6"><div className="font-display text-3xl font-semibold text-primary">{n}</div><div className="mt-1 text-sm text-muted-foreground">{l}</div></div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[["Польза", "Создаём то, что делает жизнь лучше — внутри команды и снаружи."], ["Диалог", "Говорим о важном прямо и вовремя."], ["Развитие", "Учимся, растём и внедряем — вместе с вами."]].map(([t, d]) => (
            <div key={t} className="rounded-3xl border border-border p-6"><div className="font-semibold">{t}</div><div className="mt-1 text-sm text-muted-foreground">{d}</div></div>
          ))}
        </div>
      </div>
    </section>
  );
}
