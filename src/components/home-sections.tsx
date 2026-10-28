import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Mic, Plus, Send, Bot } from "lucide-react";

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function OutlineButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mk-outline">
      {children}
      <ArrowUpRight className="h-4 w-4" />
    </button>
  );
}

/* 2. Текст про AI-помощника, проявляется при прокрутке */
const AI_TEXT =
  "AI-помощник отвечает за секунды. Знает кассы Эвотор, Касатка и другие. Подберёт модель под ваше дело. Поможет устранить типичные сбои и разберёт нестандартные кейсы. В него зашит девятилетний опыт реальных живых сервисных инженеров. Обучит кассира с нуля: подскажет, как принять товар по ЭДО, сделать возврат и отправить зависшие чеки. Проконсультирует по автоматизации учёта и изменениям в законе. Подскажет, как соединить кассу с эквайрингом. Даст инструкцию, как подключить сканер, весы и принтер этикеток. Подберёт бонусную программу, чтобы удержать клиентов и увеличить выручку.";

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
      setProgress(Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35))));
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

/* 3. Три лёгких действия */
export function QuickActions() {
  const items = [
    { t: "Каталог оборудования", d: "Кассы, сканеры, весы и принтеры этикеток — посмотреть вживую." },
    { t: "Истории клиентов", d: "Как наши клиенты работают с кассой каждый день." },
    { t: "Что входит в сервис", d: "Из чего складывается забота о вашей кассе." },
  ];
  return (
    <section className="mk-section pt-0">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((x) => (
          <button key={x.t} type="button" title="Раздел в разработке" className="mk-card group text-left">
            <span className="flex items-center justify-between text-lg font-semibold">
              {x.t}
              <ArrowUpRight className="h-5 w-5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
            <span className="mt-2 block text-sm text-[var(--mk-muted)]">{x.d}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* 4. Польза и цифры */
export function Benefit() {
  const stats = [
    ["5 000 000+", "Чеков отправлено"],
    ["9 лет", "в кассовом сервисе"],
    ["300+", "точек бизнеса на сопровождении"],
    ["40+", "сфер бизнеса"],
  ];
  return (
    <section className="mk-section text-center">
      <p className="mx-auto max-w-3xl text-xl leading-relaxed text-[var(--mk-muted)] md:text-2xl">
        Уютное кафе, магазин у дома, автосервис, цветочная лавка и детская студия. У них есть что-то общее.{" "}
        <span className="text-[var(--mk-fg)]">Каждый пробитый чек — это реальная польза, которую получил клиент.</span>{" "}
        Будь то уроки танцев, свежий хлеб или красивая причёска.
      </p>
      <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-12">
        {stats.map(([n, l]) => (
          <div key={l}>
            <div className="text-4xl font-semibold tracking-tight md:text-6xl">{n}</div>
            <div className="mt-2 text-sm text-[var(--mk-muted)] md:text-base">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* 5. Призыв подать заявку */
export function JoinCta() {
  return (
    <section id="join" className="mk-section text-center">
      <h2 className="mk-h2 mx-auto max-w-4xl">Присоединяйтесь к сервису или переведите кассы на надёжное сопровождение</h2>
      <div className="mt-10"><OutlineButton onClick={() => go("ask")}>Подать заявку</OutlineButton></div>
    </section>
  );
}

/* 6. Карта */
export function GeoMap() {
  // Метки: офис Ростов (ул. М. Горького 151), Аксай, Батайск, Таганрог, Краснодар
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
      <p className="mx-auto mt-4 max-w-xl text-center text-[var(--mk-muted)]">Офис: Ростов-на-Дону, ул. М. Горького 151, 3 этаж. Клиенты по всему югу: Аксай, Батайск, Таганрог, Краснодар.</p>
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

/* 7. Партнёрство */
export function Partners() {
  return (
    <section className="mk-section text-center">
      <h2 className="mk-h2">Партнёрская программа</h2>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-[var(--mk-muted)]">
        Много лет работаем в связке с бухгалтерами и юристами: их клиенты — наши клиенты, а наши — их. Приглашаем к партнёрству и наших клиентов.
      </p>
      <div className="mt-10"><OutlineButton>Узнать подробнее</OutlineButton></div>
    </section>
  );
}

/* 8. Вопросы о сервисе */
const FAQ = [
  ["У меня уже есть касса, купленная в другом месте. Возьмёте на сервис?", "Конечно возьмём. Проверим кассу, обновим прошивку и подключим к сервису. Более того, можем принять вашу кассу б/у и выдать новую с небольшой доплатой."],
  ["Что делать, если касса встанет в выходной день?", "Мы не уходим на выходные — на связи ежедневно. Если у вас касса подходящего типа, обеспечим горячую замену без замены фискального накопителя. На сервисе это не стоит ровным счётом ничего."],
  ["Кто следит за сроком фискального накопителя? Что, если мы его пропустим?", "За этим следим мы и уведомляем заранее. К тому же закон даёт 30 дней на устранение неполадок с отправкой чеков в ФНС — мы точно успеем. Снимаем с вас это напряжение."],
  ["У меня один небольшой островок с кофе. Работаете с такими?", "Работаем и одинаково заботимся о каждом. Есть кассы под любой масштаб: от маленьких переносных на аккумуляторе до больших стационарных систем. Всегда подбираем оптимальный вариант, чтобы касса приносила пользу и помогала бизнесу расти."],
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

/* 9. Живой диалог с AI-помощником (пока демонстрация) */
const DEMO: Record<string, string> = {
  "Подойдёт ли касса для островка с кофе?": "Да. Для островка подойдёт компактная касса на аккумуляторе со встроенной оплатой картой и СБП. Подберу модель под ваш ассортимент.",
  "Что делать, если чек завис?": "Не перезагружайте кассу сразу. Проверьте интернет и статус ОФД. Если не помогло — подключу дежурного инженера.",
  "Как сдать старую кассу и взять новую?": "Мы принимаем кассу б/у и выдаём новую с небольшой доплатой. Оставьте заявку — инженер посчитает условия.",
};

export function AskAi() {
  const [q, setQ] = useState<string | null>(null);
  const [text, setText] = useState("");
  return (
    <section id="ask" className="mk-section text-center">
      <h2 className="mk-h2 mx-auto max-w-4xl">Готовы задать свой вопрос и протестировать, как работает AI-помощник в реальном времени?</h2>
      <p className="mx-auto mt-4 max-w-xl text-[var(--mk-muted)]">Ответит за секунды — голосом или текстом.</p>
      <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-[var(--mk-border)] bg-[var(--mk-surface)] p-5 text-left backdrop-blur">
        <div className="space-y-3 text-sm">
          <div className="flex gap-2"><Bot className="mt-1 h-5 w-5 shrink-0" /><div className="rounded-2xl bg-[var(--mk-bubble)] p-3">Здравствуйте! Спросите о кассах, законе или подключении оборудования.</div></div>
          {q && <>
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl bg-[var(--mk-fg)] p-3 text-[var(--mk-bg)]">{q}</div>
            <div className="flex gap-2"><Bot className="mt-1 h-5 w-5 shrink-0" /><div className="rounded-2xl bg-[var(--mk-bubble)] p-3">{DEMO[q] ?? "Спасибо за вопрос! Скоро здесь будет отвечать настоящий AI-помощник."}</div></div>
          </>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.keys(DEMO).map((k) => (
            <button key={k} type="button" onClick={() => setQ(k)} className="rounded-full border border-[var(--mk-border)] px-3 py-1.5 text-xs">{k}</button>
          ))}
        </div>
        <form className="mt-4 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { setQ(text.trim()); setText(""); } }}>
          <button type="button" aria-label="Задать вопрос голосом" title="Голосовой режим скоро" className="mk-icon-btn"><Mic className="h-5 w-5" /></button>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ваш вопрос…" className="h-12 flex-1 rounded-full border border-[var(--mk-border)] bg-transparent px-5 outline-none" />
          <button type="submit" aria-label="Отправить" className="mk-icon-btn"><Send className="h-5 w-5" /></button>
        </form>
      </div>
    </section>
  );
}

/* 10. Подвал */
export function SiteFooter() {
  return (
    <footer className="mk-section pb-10 pt-16 text-sm">
      <div className="flex flex-col justify-between gap-6 border-t border-[var(--mk-border)] pt-8 md:flex-row">
        <div>
          <div className="text-lg font-semibold">Мастер Касс</div>
          <div className="mt-1 opacity-80">Кассовый сервис · Ростов-на-Дону, ул. М. Горького 151, 3 этаж</div>
        </div>
        <div className="flex flex-wrap gap-5 opacity-90">
          <button type="button" title="Раздел в разработке">Политика конфиденциальности</button>
          <button type="button" title="Раздел в разработке">Согласие на обработку персональных данных</button>
        </div>
      </div>
      <div className="mt-6 opacity-70">© 2026. Все права защищены.</div>
    </footer>
  );
}
