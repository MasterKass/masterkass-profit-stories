import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Mic, Send, Bot, Plus } from "lucide-react";
import cafe from "@/assets/team-cafe.jpg";
import florist from "@/assets/team-florist.jpg";
import bakery from "@/assets/team-bakery.jpg";
import boutique from "@/assets/team-boutique.jpg";
import salon from "@/assets/team-salon.jpg";

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function OutlineButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mk-outline">
      {children}
      <ArrowUpRight className="h-4 w-4" />
    </button>
  );
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

/* 3. Наш AI-сотрудник, текст проявляется при прокрутке */
const AI_TEXT =
  "Наш AI-сотрудник всегда на связи — голосом и текстом. В нём объединён 9-летний опыт инженеров: мгновенная диагностика сбоев, пошаговая помощь кассиру прямо у экрана, обучение новичков и запуск программ лояльности.";

export function AiReveal() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(0);
  const words = AI_TEXT.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setProgress(1);
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Проявление начинается, когда текст входит снизу, и заканчивается, когда он у верхней трети экрана
      setProgress(Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.65))));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);

  const lit = Math.round(progress * words.length);
  return (
    <section id="ai" className="mk-section">
      <p ref={ref} className="mk-reveal" aria-label={AI_TEXT}>
        {words.map((w, i) => (
          <span key={i} aria-hidden="true" className={i < lit ? "is-lit" : undefined}>{w} </span>
        ))}
      </p>
    </section>
  );
}

/* 4. Три карточки действий */
export function QuickActions() {
  const items = [
    { t: "Кассы и оборудование", d: "Живые сценарии: какая касса подойдёт именно вашему делу.", b: "Посмотреть каталог" },
    { t: "Как устроен сервис", d: "AI-наставник, карточка точки и единое окно поддержки.", b: "Исследовать" },
    { t: "Законы и маркировка", d: "Изменения в законах простым языком — заранее, а не после штрафа.", b: "Следить за изменениями" },
  ];
  return (
    <section className="mk-section pt-0">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((x) => (
          <button key={x.t} type="button" title="Раздел в разработке" className="mk-card group flex flex-col text-left">
            <span className="text-xl font-semibold tracking-tight">{x.t}</span>
            <span className="mt-2 block flex-1 text-[var(--mk-muted)]">{x.d}</span>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
              {x.b}
              <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* 5. Манифест и цифры с плавным набегом */
function CountUp({ to, run, suffix }: { to: number; run: boolean; suffix: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setV(to);
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1600);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  return <>{v.toLocaleString("ru-RU")}{suffix}</>;
}

export function Benefit() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const stats: [number, string, string][] = [
    [5, " млн+", "чеков передано"],
    [9, " лет", "в кассовом сервисе"],
    [300, "+", "точек бизнеса на сопровождении"],
    [40, "+", "сфер бизнеса"],
  ];
  return (
    <section className="mk-section text-center">
      <p className="mx-auto max-w-3xl text-xl leading-relaxed text-[var(--mk-muted)] md:text-2xl">
        Любимое кафе, магазин у дома, автосервис, салон красоты и детская студия. У них есть что-то общее.{" "}
        <span className="text-[var(--mk-fg)]">Каждый пробитый чек — это реальная польза, которую получил человек:</span>{" "}
        горячий кофе, свежий хлеб, исправный автомобиль, аккуратная стрижка или уроки танцев.
      </p>
      <div ref={ref} className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-12">
        {stats.map(([n, s, l]) => (
          <div key={l}>
            <div className="text-4xl font-semibold tabular-nums tracking-tight md:text-6xl"><CountUp to={n} suffix={s} run={inView} /></div>
            <div className="mt-2 text-sm text-[var(--mk-muted)] md:text-base">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* 6. Призыв подать заявку */
export function JoinCta() {
  return (
    <section id="join" className="mk-section text-center">
      <h2 className="mk-h2 mx-auto max-w-4xl">Присоединяйтесь к сервису</h2>
      <p className="mx-auto mt-5 max-w-xl text-lg text-[var(--mk-muted)] md:text-xl">Переведите кассу на надёжное сопровождение</p>
      <div className="mt-10"><OutlineButton onClick={() => go("ask")}>Подать заявку</OutlineButton></div>
    </section>
  );
}

/* 7. Карта */
export function GeoMap() {
  const pts = [
    "39.7120,47.2290,pm2rdl",
    "39.8756,47.2690,pm2bll",
    "39.7451,47.1383,pm2bll",
    "38.8970,47.2362,pm2bll",
    "38.9769,45.0355,pm2bll",
  ].join("~");
  return (
    <section className="mk-section">
      <h2 className="mk-h2 text-center">Работаем рядом с вами</h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-[var(--mk-muted)]">Центральный офис: Ростов-на-Дону, ул. М. Горького 151, 3 этаж. Сопровождаем точки в Ростове, Аксае, Батайске, Таганроге и Краснодаре.</p>
      <div className="mt-10 overflow-hidden rounded-3xl border border-[var(--mk-border)]">
        <iframe
          title="Карта присутствия Мастер Касс"
          src={`https://yandex.ru/map-widget/v1/?ll=39.3,46.2&z=7&pt=${pts}`}
          className="block h-[420px] w-full md:h-[500px]"
          loading="lazy"
        />
      </div>
    </section>
  );
}

/* 8. Истории клиентов */
export function ClientStories() {
  const [ref, inView] = useInView<HTMLElement>();
  const photos = [
    { src: cafe, alt: "Команда кофейни", cls: "left-[2%] top-[4%] w-28 md:w-44 -rotate-6", d: 0 },
    { src: florist, alt: "Команда цветочного салона", cls: "right-[3%] top-[0%] w-24 md:w-40 rotate-6", d: 150 },
    { src: bakery, alt: "Команда пекарни", cls: "left-[6%] bottom-[2%] w-24 md:w-36 rotate-3", d: 300 },
    { src: boutique, alt: "Владелицы магазина одежды", cls: "right-[6%] bottom-[4%] w-28 md:w-44 -rotate-3", d: 450 },
    { src: salon, alt: "Команда парикмахерской", cls: "left-1/2 -translate-x-1/2 bottom-[-6%] w-20 md:w-32 rotate-2 hidden md:block", d: 600 },
  ];
  return (
    <section ref={ref} className={`mk-section mk-stories ${inView ? "is-in" : ""}`}>
      <div className="relative mx-auto flex min-h-[460px] max-w-5xl flex-col items-center justify-center text-center md:min-h-[560px]">
        {photos.map((p) => (
          <img key={p.alt} src={p.src} alt={p.alt} loading="lazy" style={{ transitionDelay: `${p.d}ms` }}
            className={`mk-stories-photo absolute aspect-square rounded-3xl object-cover shadow-lg ${p.cls}`} />
        ))}
        <h2 className="mk-h2 relative z-10 max-w-xl px-20 md:px-0">Наши клиенты и их истории автоматизации</h2>
        <div className="relative z-10 mt-8"><OutlineButton>Посмотреть истории</OutlineButton></div>
      </div>
    </section>
  );
}

/* 9. Партнёрство */
export function Partners() {
  return (
    <section className="mk-section text-center">
      <h2 className="mk-h2">Партнёрская программа</h2>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-[var(--mk-muted)]">
        Работаем в связке с бухгалтерским аутсорсом, юристами и нашими клиентами. Приглашаем стать партнёром сервиса.
      </p>
      <div className="mt-10"><OutlineButton>Узнать подробнее</OutlineButton></div>
    </section>
  );
}

/* 10. Вопросы о сервисе */
const FAQ = [
  ["У меня уже есть касса, купленная в другом месте. Возьмёте на сервис или нужно покупать новую?", "Конечно возьмём. Проверим состояние, обновим прошивку и подключим к сервису. Можем также принять вашу кассу б/у и выдать современную модель с небольшой доплатой."],
  ["Что делать, если касса встанет в выходной день?", "Мы не уходим на выходные — дежурные инженеры на связи ежедневно. Для касс поддерживаемого типа обеспечиваем горячую замену аппарата без покупки нового фискального накопителя. Для клиентов на сервисе это бесплатно."],
  ["Кто следит за сроками фискального накопителя? Что, если мы пропустим срок?", "За этим следим мы и уведомляем заранее. К тому же по закону на устранение неполадок с отправкой чеков есть 30 дней — мы спокойно успеем всё решить."],
  ["У меня всего один небольшой островок кофе. Работаете с такими или только с сетями?", "Работаем и одинаково заботимся о каждом. Подбираем аппарат под конкретную задачу: от компактных касс на аккумуляторе до систем для магазинов."],
];

export function ServiceFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mk-section">
      <h2 className="mk-h2 text-center">Вопросы о сервисе</h2>
      <div className="mx-auto mt-10 max-w-3xl divide-y divide-[var(--mk-border)] rounded-3xl border border-[var(--mk-border)] bg-[var(--mk-surface)] backdrop-blur">
        {FAQ.map(([q, a], i) => (
          <div key={q}>
            <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium">
              {q}
              <Plus className={`h-5 w-5 shrink-0 transition ${open === i ? "rotate-45" : ""}`} />
            </button>
            {open === i && <p className="px-6 pb-6 leading-relaxed text-[var(--mk-muted)]">{a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

/* 11. Карточка AI-помощника (демонстрация) */
const DEMO: Record<string, string> = {
  "Как закрыть смену, если касса зависла?": "Сначала проверьте интернет и статус ОФД, затем откройте «Отчёты» → «Закрыть смену». Если не получается — подключу инженера.",
  "Как принять товар по ЭДО?": "Откройте документ в разделе ЭДО, сверьте позиции и подпишите. Расскажу пошагово голосом, если удобнее.",
  "Как запустить бонусы для постоянных гостей?": "Помогу настроить программу лояльности и проверить гипотезу на ваших данных. Начнём с простого кешбэка?",
};
const PROMPTS = Object.keys(DEMO);

function useTypewriter(lines: string[], active: boolean) {
  const [txt, setTxt] = useState("");
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setTxt(lines[0] ?? "");
    let li = 0, ci = 0, del = false, t = 0;
    const step = () => {
      const line = lines[li] ?? "";
      ci += del ? -1 : 1;
      setTxt(line.slice(0, ci));
      let wait = del ? 25 : 55;
      if (!del && ci === line.length) { del = true; wait = 1800; }
      else if (del && ci === 0) { del = false; li = (li + 1) % lines.length; wait = 400; }
      t = window.setTimeout(step, wait);
    };
    t = window.setTimeout(step, 400);
    return () => clearTimeout(t);
  }, [active, lines]);
  return txt;
}

export function AskAi() {
  const [q, setQ] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [voice, setVoice] = useState(false);
  const typed = useTypewriter(PROMPTS, !text && !voice);
  return (
    <section id="ask" className="mk-section text-center">
      <h2 className="mk-h2 mx-auto max-w-4xl">Готовы задать свой вопрос и протестировать AI-помощника в реальном времени?</h2>
      <p className="mx-auto mt-4 max-w-xl text-[var(--mk-muted)]">Он знает нюансы оборудования и законов — ответит за секунды текстом или голосом.</p>
      <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-[var(--mk-border)] bg-[var(--mk-surface)] p-5 text-left shadow-xl backdrop-blur">
        <div className="mb-4 inline-flex rounded-full border border-[var(--mk-border)] p-1 text-sm">
          {[["Текст", false], ["Голос", true]].map(([l, v]) => (
            <button key={String(l)} type="button" onClick={() => setVoice(v as boolean)}
              className={`rounded-full px-4 py-1.5 transition ${voice === v ? "bg-[var(--mk-fg)] text-[var(--mk-bg)]" : ""}`}>{l as string}</button>
          ))}
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex gap-2"><Bot className="mt-1 h-5 w-5 shrink-0" /><div className="rounded-2xl bg-[var(--mk-bubble)] p-3">Здравствуйте! Спросите о кассе, подключённых сервисах или законах.</div></div>
          {q && <>
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl bg-[var(--mk-fg)] p-3 text-[var(--mk-bg)]">{q}</div>
            <div className="flex gap-2"><Bot className="mt-1 h-5 w-5 shrink-0" /><div className="rounded-2xl bg-[var(--mk-bubble)] p-3">{DEMO[q] ?? "Спасибо за вопрос! Скоро здесь будет отвечать настоящий AI-помощник."}</div></div>
          </>}
        </div>
        {voice ? (
          <div className="mt-5 flex items-center gap-4 rounded-full border border-[var(--mk-border)] px-5 py-3">
            <Mic className="h-5 w-5" />
            <span className="mk-wave flex h-5 items-center gap-1" aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ animationDelay: `${i * 70}ms` }} />)}
            </span>
            <span className="text-sm text-[var(--mk-muted)]">Голосовой режим скоро заработает</span>
          </div>
        ) : (
          <form className="mt-5 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); const v = text.trim() || typed; if (v) { setQ(PROMPTS.find((p) => p.startsWith(v)) ?? v); setText(""); } }}>
            <button type="button" onClick={() => setVoice(true)} aria-label="Задать вопрос голосом" className="mk-icon-btn"><Mic className="h-5 w-5" /></button>
            <div className="relative h-12 flex-1">
              <input value={text} onChange={(e) => setText(e.target.value)} aria-label="Ваш вопрос" className="h-12 w-full rounded-full border border-[var(--mk-border)] bg-transparent px-5 outline-none" />
              {!text && <span className="pointer-events-none absolute inset-y-0 left-5 flex items-center truncate pr-4 text-sm text-[var(--mk-muted)]">{typed}<span className="mk-caret" /></span>}
            </div>
            <button type="submit" aria-label="Отправить" className="mk-icon-btn"><Send className="h-5 w-5" /></button>
          </form>
        )}
      </div>
    </section>
  );
}

/* 12. Подвал */
export function SiteFooter() {
  return (
    <footer className="mk-section pb-10 pt-16 text-sm">
      <div className="flex flex-col justify-between gap-6 border-t border-[var(--mk-border)] pt-8 md:flex-row">
        <div className="opacity-80">Кассовый сервис · Ростов-на-Дону, ул. М. Горького 151, 3 этаж</div>
        <div className="flex flex-wrap gap-5 opacity-90">
          <button type="button" title="Раздел в разработке">Политика конфиденциальности</button>
          <button type="button" title="Раздел в разработке">Согласие на обработку персональных данных</button>
        </div>
      </div>
      <div className="mt-6 opacity-70">© 2026. Все права защищены.</div>
    </footer>
  );
}
