import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, Plus, ShieldCheck, MessageCircleMore, Keyboard, Mic } from "lucide-react";
import cafe from "@/assets/team-cafe.jpg";
import florist from "@/assets/team-florist.jpg";
import bakery from "@/assets/team-bakery.jpg";
import boutique from "@/assets/team-boutique.jpg";
import salon from "@/assets/team-salon.jpg";
import { BrandMark } from "@/components/brand-mark";

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function OutlineButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mk-outline">
      {children}
      <ArrowUpRight className="h-4 w-4" />
    </button>
  );
}

function useInView<T extends HTMLElement>(opts: IntersectionObserverInit = { threshold: 0.3 }) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setInView(true); io.disconnect(); } }, opts);
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

/* 3. Наш AI-сотрудник, текст проявляется при прокрутке */
const AI_TEXT =
  "Наш AI сотрудник на связи 24/7. В нём 9-ти летний опыт инженеров: диагностика сбоев, обучение, помощь кассиру и управление системой лояльности.";

const AI_WORDS = AI_TEXT.split(" ");
// Порог окрашивания каждого слова: первое — сразу, остальные по числу букв (длинные слова читаются дольше).
const AI_THRESHOLDS = (() => {
  const weights = AI_WORDS.slice(1).map((w) => w.replace(/[^\p{L}\p{N}]/gu, "").length + 2);
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  return [0, ...weights.map((w) => (acc += w) / total)];
})();

// Микро-иконки после ключевых слов: рука со смартфоном, щит, облачко подсказки.
const AI_ICONS: Record<string, React.ReactNode> = {
  "24/7.": <HandPhoneIcon />,
  "сбоев,": <ShieldCheck className="h-[0.55em] w-[0.55em]" strokeWidth={1.8} />,
  "кассиру": <MessageCircleMore className="h-[0.55em] w-[0.55em]" strokeWidth={1.8} />,
};

function HandPhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[0.55em] w-[0.55em]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8" y="2.5" width="9" height="14" rx="2" />
      <path d="M11.5 13.5h2" />
      <path d="M8 10.5 5.6 12.4a2 2 0 0 0-.6 2.3l1.6 3.8A4 4 0 0 0 10.3 21H14a3 3 0 0 0 3-3v-1.5" />
    </svg>
  );
}

export function AiReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(-1);
  const words = AI_WORDS;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setProgress(1);
    let frame = 0;
    let done = false;
    const update = () => {
      frame = 0;
      if (done) return;
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top + 32; // верх текста (с учётом отступа секции)
      const start = vh * 0.66; // текст поднялся на две трети экрана — загорается первое слово
      const end = 110; // последнее слово — когда текст у самого верха, под шапкой
      if (top > start) return;
      const p = Math.min(1, (start - top) / (start - end));
      setProgress((prev) => Math.max(prev, p));
      if (p >= 1) {
        done = true; // однократное окрашивание
        window.removeEventListener("scroll", onScroll);
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);

  const lit = progress < 0 ? 0 : AI_THRESHOLDS.filter((t) => t <= progress).length;
  return (
    <section id="ai" ref={sectionRef} className="mk-section mk-ai-section" style={{ paddingTop: "2rem" }}>
      <p className="mk-reveal" aria-label={AI_TEXT}>
        {words.map((w, i) => (
          <span key={i} aria-hidden="true" className={i < lit ? "is-lit" : undefined}>
            {w}{" "}
            {AI_ICONS[w] && <span className={`mk-reveal-icon${i < lit ? " is-on" : ""}`}>{AI_ICONS[w]}</span>}
            {AI_ICONS[w] && " "}
          </span>
        ))}
      </p>
    </section>
  );
}

/* 4. Три карточки действий: заголовок вверху, кнопка внизу */
export function QuickActions() {
  const items = [
    { t: "Кассы и оборудование", b: "Посмотреть каталог" },
    { t: "Как устроен сервис", b: "Исследовать" },
    { t: "Законы и маркировка", b: "Следить за изменениями" },
  ];
  return (
    <section id="services" className="mk-section pt-0">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((x) => (
          <div key={x.t} className="mk-tile">
            <span className="mk-tile-title">{x.t}</span>
            {x.t === "Как устроен сервис" ? (
              <Link to="/service" className="mk-tile-btn">{x.b}</Link>
            ) : (
              <button type="button" title="Раздел в разработке" className="mk-tile-btn">{x.b}</button>
            )}
          </div>
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
  const [ref] = useInView<HTMLDivElement>();
  const [boltRef, boltOn] = useInView<HTMLSpanElement>();
  // Цифры стартуют сразу после окончания первой вспышки (0.1 с задержка + 1.15 с вспышка)
  const [inView, setCountOn] = useState(false);
  useEffect(() => {
    if (!boltOn) return;
    const t = setTimeout(() => setCountOn(true), 1250);
    return () => clearTimeout(t);
  }, [boltOn]);
  const stats: [number, string, string][] = [
    [5, " млн+", "чеков передано"],
    [9, " лет", "в кассовом сервисе"],
    [300, "+", "точек бизнеса на сопровождении"],
    [40, "+", "сфер бизнеса"],
  ];
  return (
    <section id="benefit" className="mk-section text-center">
      <p className="mx-auto max-w-2xl text-[1.05rem] leading-[1.42] tracking-[-0.015em] text-[var(--mk-muted)] md:text-xl md:leading-[1.45]">
        Любимое кафе, магазин у дома, автосервис, салон красоты и детская студия. У них есть что-то общее.{" "}
        <span ref={boltRef} className={`mk-bolt${boltOn ? " is-on" : ""}`}>Каждый пробитый чек - реальная польза, которую получил человек:</span>{" "}
        горячий кофе, свежий хлеб, исправный автомобиль, аккуратная стрижка или уроки танцев.
      </p>
      <div ref={ref} className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-12">
        {stats.map(([n, s, l]) => (
          <div key={l}>
            <div className="text-4xl font-semibold tabular-nums tracking-tight md:text-6xl"><CountUp to={n} suffix={s} run={inView} /></div>
            <div className="mt-2 text-base leading-snug text-[var(--mk-muted)] md:text-lg">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* 6. Призыв подать заявку */
export function JoinCta() {
  return (
    <div className="mk-band">
      <section id="join" className="mk-section mk-section-airy text-center">
        <h2 className="mk-h2 mx-auto max-w-4xl">Присоединяйтесь к сервису</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-[var(--mk-muted)] md:text-xl">Переведите кассу на надёжное сопровождение</p>
        <div className="mt-10"><OutlineButton onClick={() => go("ask")}>Подать заявку</OutlineButton></div>
      </section>
    </div>
  );
}

/* 7. Карта */
const MAP_LON0 = 36.46, MAP_LAT0 = 49.46;
const mp = (lon: number, lat: number) => [ (lon - MAP_LON0) * 100, (MAP_LAT0 - lat) * 100 ] as const;
const mpath = (pts: number[][], close = false) =>
  pts.map(([a, b], i) => { const [x, y] = mp(a!, b!); return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ") + (close ? " Z" : "");
const AZOV = [[36,46.95],[37.0,47.0],[38.0,47.05],[38.6,47.1],[38.9,47.14],[39.15,47.2],[39.3,47.1],[38.7,46.85],[38.3,46.6],[37.9,45.95],[37.4,45.55],[36.9,45.35],[36,45.3]];
const BLACK = [[34,44.9],[36,45.1],[37.0,45.0],[37.3,44.9],[37.9,44.55],[38.6,44.1],[39.4,43.6],[40.0,43.15],[41.0,42.8],[44,42.4],[44,41.5],[34,41.5]];
const DON = [[43,48.4],[42.2,47.85],[41.3,47.6],[40.6,47.55],[40.1,47.4],[39.75,47.24],[39.4,47.1],[39.2,47.1]];
const KUBAN = [[42.2,45.1],[41.3,45.0],[40.3,45.12],[39.0,45.05],[38.2,45.3],[37.6,45.32]];
const CITIES: { n: string; c: [number, number]; lab?: "r" | "l" | "t" | "b"; dy?: number; b?: boolean }[] = [
  { n: "Таганрог", c: [38.9, 47.21] }, { n: "Новочеркасск", c: [40.1, 47.42], dy: -6 }, { n: "Шахты", c: [40.21, 47.71], lab: "l" },
  { n: "Каменск-Шахтинский", c: [40.27, 48.32] }, { n: "Зерноград", c: [40.31, 46.85] }, { n: "Сальск", c: [41.54, 46.47] },
  { n: "Волгодонск", c: [42.15, 47.51] }, { n: "Краснодар", c: [38.98, 45.04], b: true }, { n: "Новороссийск", c: [37.77, 44.72] },
  { n: "Сочи", c: [39.72, 43.6] }, { n: "Ставрополь", c: [41.97, 45.04], b: true },
];
const ROSTOV: [number, number] = [39.71, 47.23];

export function GeoMap() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [rx, ry] = mp(...ROSTOV);
  const W = 700, H = 700;
  const dist = (c: [number, number]) => Math.hypot(c[0] - ROSTOV[0], c[1] - ROSTOV[1]);
  const place = (c: (typeof CITIES)[number]) =>
    c.lab === "l" ? { dx: -9, anchor: "end" as const, dy: 4 }
    : c.lab === "t" ? { dx: 0, anchor: "middle" as const, dy: -10 }
    : c.lab === "b" ? { dx: 0, anchor: "middle" as const, dy: 20 }
    : { dx: 9, anchor: "start" as const, dy: 4 };
  return (
    <section id="map" className="mk-section">
      <h2 className="mk-h2 text-center">Работаем рядом с вами</h2>
      <div ref={ref} className="mk-geo relative mt-10 mb-[122px] aspect-square overflow-hidden rounded-2xl border border-[var(--mk-border)] md:mb-[98px] md:aspect-[16/13]" data-on={inView || undefined}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-label="Карта присутствия Мастер Касс на Юге России" role="img">
          <g className="mk-geo-cam" style={{ transformOrigin: `${rx}px ${ry}px` }}>
            <path d={mpath(AZOV, true)} className="mk-geo-sea" />
            <path d={mpath(BLACK, true)} className="mk-geo-sea" />
            <path d={mpath(DON)} className="mk-geo-river" />
            <path d={mpath(KUBAN)} className="mk-geo-river" />
            {CITIES.map((c) => { const [x, y] = mp(...c.c); const d = 0.9 + dist(c.c) * 0.45; const p = place(c); return (
              <g key={c.n} className="mk-geo-pt" style={{ animationDelay: `${d}s`, transformOrigin: `${x}px ${y}px` }}>
                <circle cx={x} cy={y} r={9} className="mk-geo-halo" />
                <circle cx={x} cy={y} r={4} className="mk-geo-dot" />
                <text x={x + p.dx} y={y + (c.dy ?? p.dy)} textAnchor={p.anchor} className={c.b ? "mk-geo-lbl mk-geo-lbl--strong" : "mk-geo-lbl"}>{c.n}</text>
              </g>
            ); })}
            <g className="mk-geo-hq">
              <circle cx={rx} cy={ry} r={7} className="mk-geo-pulse" />
              <circle cx={rx} cy={ry} r={7} className="mk-geo-hqdot" />
              <text x={rx + 14} y={ry + 17} className="mk-geo-hqlbl">Ростов-на-Дону</text>
            </g>
          </g>
        </svg>
      </div>
    </section>
  );
}

/* 8. Истории клиентов */
// Каждая группа фото проявляется сама, когда именно она попадает в поле зрения.
function StoriesGroup({ children }: { children: React.ReactNode }) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0, rootMargin: "0px 0px -15% 0px" });
  return <div ref={ref} className={`mk-stories-group flex w-full flex-col items-center gap-14 ${inView ? "is-in" : ""}`}>{children}</div>;
}

export function ClientStories() {
  const top = [cafe, salon, florist, bakery, boutique];
  const bottom = [florist, boutique, salon, cafe, bakery];
  const alts = ["Команда кофейни", "Команда парикмахерской", "Команда цветочного салона", "Команда пекарни", "Владелицы магазина одежды"];
  // Порядок «вразнобой» внутри каждой группы из 5 фото.
  const order = [2, 0, 4, 1, 3];
  const Photo = ({ src, alt, idx }: { src: string; alt: string; idx: number }) => (
    <img src={src} alt={alt} style={{ transitionDelay: `${(order[idx] ?? 0) * 90}ms` }}
      className="mk-stories-photo aspect-square w-[15%] max-w-20 rounded-lg object-cover md:w-20" />
  );
  const Row = ({ items, offset, start }: { items: string[]; offset: number; start: number }) => (
    <div className="flex w-full justify-between">
      {items.map((src, i) => <Photo key={i} src={src} alt={alts[(i + offset) % 5] ?? ""} idx={start + i} />)}
    </div>
  );
  const Mid = ({ items, offset, start }: { items: string[]; offset: number; start: number }) => (
    <div className="flex w-full justify-center gap-[22%]">
      {items.map((src, i) => <Photo key={i} src={src} alt={alts[(i + offset) % 5] ?? ""} idx={start + i} />)}
    </div>
  );
  return (
    <section id="clients" className="mk-section mk-stories">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-14 px-2 text-center">
        <StoriesGroup>
          <Row items={top.slice(0, 3)} offset={0} start={0} />
          <Mid items={top.slice(3)} offset={3} start={3} />
        </StoriesGroup>
        <div className="py-10">
          <h2 className="mk-h2">Наши клиенты</h2>
          <div className="mt-8"><button type="button" title="Раздел в разработке" className="mk-tile-btn">Смотреть истории</button></div>
        </div>
        <StoriesGroup>
          <Mid items={bottom.slice(0, 2)} offset={1} start={0} />
          <Row items={bottom.slice(2)} offset={4} start={2} />
        </StoriesGroup>
      </div>
    </section>
  );
}

/* 9. Партнёрство */
export function Partners() {
  return (
    <section id="partners" className="mk-section mk-partners text-center">
      <h2 className="mk-h2">Партнёрская программа</h2>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-[var(--mk-muted)]">
        Работаем в партнёрстве с бухгалтерами, юристами и нашими клиентами. Приглашаем стать партнёрами сервиса.
      </p>
      <div className="mt-10"><OutlineButton>Узнать подробнее</OutlineButton></div>
    </section>
  );
}

/* 10. Вопросы о сервисе */
const FAQ = [
  {
    q: "Как вы гарантируете безопасность моих данных? Почему я могу вам доверить цифры своего бизнеса?",
    a: [
      "Ваши данные хранятся на серверах в России. Обращения и карточки клиентов ведём в «Битрикс24»: это российская система, её базы находятся в защищённых дата-центрах на территории РФ, а передача идёт по защищённым протоколам шифрования. Обработка персональных данных выполняется по закону 152-ФЗ.",
      "Личный кабинет привязан к номеру телефона и открывается по SMS-коду: код приходит только вам. Внутри кабинета доступ разграничен по ролям, и каждый видит только те данные, которые нужны для его задач.",
      "ИИ-сотрудник обращается к вашим данным только в момент активной сессии, когда вы задаёте вопрос. Сервер подставляет нужную выписку, помощник отвечает и не «держит их в памяти»: мы не обучаем модель на данных клиентов и не передаём их третьим лицам.",
      "Отозвать согласие на обработку можно в любой момент: напишите нам на почту или скажите вашему инженеру, и мы прекратим обработку.",
    ],
  },
  {
    q: "У меня уже есть касса, купленная в другом месте. Возьмёте на сервис или нужно покупать новую?",
    a: ["Конечно возьмём. Проверим состояние, обновим прошивку и подключим к сервису. Можем также принять вашу кассу б/у и выдать современную модель с небольшой доплатой."],
  },
  {
    q: "Что делать, если касса встанет в выходной день?",
    a: ["Мы не уходим на выходные. Дежурные инженеры на связи ежедневно. Для касс поддерживаемого типа обеспечиваем горячую замену аппарата без покупки нового фискального накопителя. Для клиентов на сервисе это бесплатно."],
  },
  {
    q: "Кто следит за сроками фискального накопителя? Что, если мы пропустим срок?",
    a: ["За этим следим мы и уведомляем заранее. К тому же по закону на устранение неполадок с отправкой чеков есть 30 дней, и мы спокойно успеем всё решить."],
  },
  {
    q: "У меня всего один небольшой островок кофе. Работаете с такими или только с сетями?",
    a: ["Работаем и одинаково заботимся о каждом. Подбираем аппарат под конкретную задачу: от компактных касс на аккумуляторе до систем для магазинов."],
  },
];

export function ServiceFaq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="mk-section">
      <h2 className="mk-h2 text-center">Вопросы о сервисе</h2>
      <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-2">
        {FAQ.map(({ q, a }, i) => (
          <div key={q} className="mk-faq-card">
            <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}
              className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left text-[15px] font-medium leading-snug tracking-[-0.01em]">
              {q}
              <ChevronDown strokeWidth={1.5} className={`h-4 w-4 shrink-0 opacity-50 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <div className="flex flex-col gap-3 px-4 pb-4">
                {a.map((p) => (
                  <p key={p} className="text-[14px] leading-relaxed text-[var(--mk-muted)]">{p}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* 11. Карточка AI-помощника (демонстрация) */
const DEMO: Record<string, string> = {
  "Как закрыть смену, если касса зависла?": "Сначала проверьте интернет и статус ОФД, затем откройте «Отчёты» → «Закрыть смену». Если не получается, подключу инженера.",
  "Как принять товар по ЭДО?": "Откройте документ в разделе ЭДО, сверьте позиции и подпишите. Расскажу пошагово голосом, если удобнее.",
  "Как запустить бонусы для клиентов?": "Помогу настроить программу лояльности и проверить гипотезу на ваших данных. Начнём с простого кешбэка?",
};
const PROMPTS = Object.keys(DEMO);

function useTypewriter(lines: string[], active: boolean) {
  const [txt, setTxt] = useState("");
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setTxt(lines[0] ?? "");
    let li = 0, ci = 0, t = 0;
    const step = () => {
      const line = lines[li] ?? "";
      if (ci < line.length) {
        ci += 1;
        setTxt(line.slice(0, ci));
        t = window.setTimeout(step, 22);
        return;
      }
      t = window.setTimeout(() => {
        setTxt("");
        li = (li + 1) % lines.length;
        ci = 0;
        t = window.setTimeout(step, 320);
      }, 1600);
    };
    t = window.setTimeout(step, 400);
    return () => clearTimeout(t);
  }, [active, lines]);
  return txt;
}

export function AskAi({ title = "Задайте вопрос нашему ИИ сотруднику", prompt }: { title?: string; prompt?: string }) {
  const [q, setQ] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [voice, setVoice] = useState(false);
  const promptLines = useMemo(() => (prompt ? [prompt] : PROMPTS), [prompt]);
  const typed = useTypewriter(promptLines, !text && !voice);
  return (
    <section id="ask" className="mk-section text-center">
      <h2 className="mk-h2 mx-auto max-w-4xl">{title.split("\n").map((t, i) => <span key={i} className="block">{t}</span>)}</h2>
      {q && (
        <div className="mx-auto mt-10 max-w-2xl space-y-3 text-left text-sm">
          <div className="ml-auto w-fit max-w-[85%] whitespace-pre-line rounded-2xl bg-[var(--mk-fg)] p-3 text-[var(--mk-bg)]">{q}</div>
          <div className="w-fit max-w-[85%] rounded-2xl bg-[var(--mk-bubble)] p-3">{DEMO[q] ?? "Спасибо за вопрос! Скоро здесь будет отвечать настоящий AI-помощник."}</div>
        </div>
      )}
      <form
        className="mx-auto mt-8 max-w-2xl rounded-2xl border border-[var(--mk-border)] bg-[var(--mk-surface)] px-5 pb-3 pt-4 text-left shadow-lg"
        onSubmit={(e) => { e.preventDefault(); const v = text.trim() || typed; if (v) { setQ(PROMPTS.find((p) => p.startsWith(v)) ?? v); setText(""); } }}
      >
        <div className="relative min-h-12">
          {voice ? (
            <div className="flex h-12 items-center gap-3 text-[var(--mk-muted)]">
              <span className="mk-wave flex h-5 items-center gap-1" aria-hidden="true">
                {Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ animationDelay: `${i * 70}ms` }} />)}
              </span>
              <span className="text-sm">Голосовой режим скоро заработает</span>
            </div>
          ) : (
            <>
              <input value={text} onChange={(e) => setText(e.target.value)} aria-label="Ваш вопрос" className="h-12 w-full bg-transparent text-base outline-none" />
              {!text && <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center whitespace-pre-line pr-4 text-base leading-snug text-[var(--mk-muted)] opacity-60">{typed}</span>}
            </>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button type="button" aria-label="Добавить" className="mk-icon-btn mk-icon-plain"><Plus className="h-5 w-5" /></button>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setVoice(false)} aria-label="Ввести текстом" className={`mk-icon-btn mk-icon-plain ${voice ? "opacity-50" : ""}`}><Keyboard className="h-5 w-5" /></button>
            <button type="button" onClick={() => setVoice(true)} aria-label="Задать вопрос голосом" className={`mk-icon-btn mk-icon-plain ${voice ? "" : "opacity-60"}`}><Mic className="h-5 w-5" /></button>
          </div>
        </div>
      </form>
    </section>
  );
}

/* 12. Подвал — карточка с разделами (часть слов ведёт на готовые страницы) */
/** Слова подвала, у которых уже есть адрес: «Тарифы» открывают блок тарифов на странице сервиса. */
const FOOTER_ROUTES: Record<string, { to: "/service"; hash?: string }> = {
  "Тарифы": { to: "/service", hash: "tariffs" },
};

const FOOTER_COLUMNS: { title: string; links: string[] }[] = [
  { title: "Сервис", links: ["Как устроен сервис", "AI-сотрудник 24/7", "Тарифы", "Фонд амортизации", "Вопросы о сервисе", "Поддержка"] },
  { title: "Оборудование", links: ["Кассы и оборудование", "Кассы Эвотор", "Кассы Касатка", "Замена фискального накопителя", "Диагностика сбоев"] },
  { title: "Законы и маркировка", links: ["Честный Знак", "ЕГАИС", "Меркурий", "ЭДО и ЭЦП", "54-ФЗ"] },
  { title: "Решения", links: ["Онлайн-касса в Ростове-на-Дону", "Касса для кофейни", "Подключение маркировки", "Программа лояльности", "Обучение кассиров", "Кассы на юге России"] },
  { title: "Компания", links: ["Наши клиенты", "Истории клиентов", "Партнёрам", "Контакты"] },
];

export function SiteFooter() {
  return (
    <footer className="px-3 pb-6 pt-16 md:px-6 md:pb-8">
      <div className="mk-footer mx-auto max-w-6xl">
        <a href="/" aria-label="Мастер Касс" className="inline-flex">
          <BrandMark size={28} />
        </a>

        <nav aria-label="Разделы сайта" className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="mk-footer-title">{col.title}</div>
              <ul className="mt-3 space-y-2">
                {col.links.map((label) => {
                  const route = FOOTER_ROUTES[label];
                  return (
                    <li key={label}>
                      {route ? (
                        <Link to={route.to} hash={route.hash} className="mk-footer-link text-left">{label}</Link>
                      ) : (
                        <button type="button" title="Раздел в разработке" className="mk-footer-link text-left">{label}</button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--mk-border)] pt-5 md:flex-row md:items-center md:justify-between">
          <div className="mk-footer-link">© 2026 МастерКасс</div>
          <div className="flex flex-col gap-2 md:flex-row md:gap-6">
            <Link to="/privacy" className="mk-footer-link text-left">Политика конфиденциальности</Link>
            <Link to="/privacy" className="mk-footer-link text-left">Согласие на обработку персональных данных</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
