import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteFooter } from "@/components/home-sections";
import { BackHome } from "@/components/back-home";
import { PulseSubscribe } from "@/components/pulse-subscribe";
import { PULSE_EVENTS, PULSE_TOPICS, type PulseTopic } from "@/lib/pulse";

export const Route = createFileRoute("/pulse")({
  head: () => ({
    meta: [
      { title: "Пульс Гос.регулирования · Мастер Касс" },
      { name: "description", content: "Хроника законов о кассах, маркировке, ЕГАИС, Меркурии, НДС и ЭЦП с 2016 года понятным языком." },
      { property: "og:title", content: "Пульс Гос.регулирования · Мастер Касс" },
      { property: "og:description", content: "Что менялось для касс и бизнеса — от 54-ФЗ до разрешительного режима." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PulsePage,
});

function PulsePage() {
  const [topic, setTopic] = useState<PulseTopic | "all">("all");
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => { const t = track.current; if (t) t.scrollLeft = t.scrollWidth;
    const open = () => { const el = document.querySelector(location.hash || "#none"); const d = el?.closest("details.mk-pulse-archive") as HTMLDetailsElement | null; if (d) { d.open = true; el!.scrollIntoView(); } };
    open(); window.addEventListener("hashchange", open); return () => window.removeEventListener("hashchange", open); }, []);
  const all = [...PULSE_EVENTS].reverse().filter((e) => topic === "all" || e.topic === topic);
  const fresh = all.filter((e) => e.year >= 2025);
  const archive = all.filter((e) => e.year < 2025);
  const card = (e: (typeof PULSE_EVENTS)[number]) => (
    <article key={e.title} id={`ev-${PULSE_EVENTS.indexOf(e)}`} className="mk-pulse-item" data-now={e.now ? "" : undefined}>
      <div className="mk-pulse-meta"><span>{e.date}</span><span>· {PULSE_TOPICS[e.topic]}</span>{e.now && <span className="mk-pulse-live">Действует сейчас</span>}</div>
      <h2>{e.title}</h2>
      <p>{e.text}</p>
      <p className="mk-pulse-kassa"><b>На кассе:</b> {e.kassa}</p>
      {e.risk && <p className="mk-pulse-kassa"><b>Риски:</b> {e.risk}</p>}
      {!!e.more?.length && <details className="mk-pulse-more"><summary>Подробнее</summary>{e.more.map((m) => <p key={m}>{m}</p>)}</details>}
    </article>
  );
  return (
    <div className="mk-page mk-dark-page min-h-screen">
      <BackHome showLogin />
      <main className="mx-auto max-w-4xl px-5 pb-20 pt-10">
        <section className="mt-12 max-w-3xl">
          <h1 className="text-2xl font-semibold leading-[1.1] tracking-[-0.03em] md:text-4xl"><span className="mk-bonus-title">Пульс Гос.регулирования</span></h1>
        </section>
        <div className="mk-pulse-track-wrap"><span className="mk-pulse-bolt" aria-hidden="true" /><div ref={track} className="mk-pulse-track" role="list" aria-label="Шкала времени">
          {PULSE_EVENTS.map((e, i) => (
            <a key={e.title} role="listitem" href={`#ev-${i}`} className="mk-pulse-tick" data-topic={e.topic} data-now={e.now ? "" : undefined} title={e.title}>
              {(i === 0 || PULSE_EVENTS[i - 1]?.year !== e.year) && <span className="mk-pulse-tick-year">{e.year}</span>}
              <span className="mk-pulse-tick-dot" aria-hidden="true" />
              <span className="mk-pulse-tick-label">{e.title}</span>
            </a>
          ))}
        </div></div>
        <div className="mk-pulse-filters" role="group" aria-label="Темы">
          <button type="button" aria-pressed={topic === "all"} onClick={() => setTopic("all")}>Все</button>
          {(Object.keys(PULSE_TOPICS) as PulseTopic[]).map((t) => (
            <button key={t} type="button" aria-pressed={topic === t} onClick={() => setTopic(t)}>{PULSE_TOPICS[t]}</button>
          ))}
        </div>
        <div className="mk-pulse-grid">{fresh.map(card)}</div>
        {archive.length > 0 && (
          <details className="mk-pulse-archive">
            <summary>Хроника с 2016 года · {archive.length}</summary>
            <div className="mk-pulse-grid">{archive.map(card)}</div>
          </details>
        )}
        <PulseSubscribe />
      </main>
      <div className="mk-pulse-footer px-4 pb-6"><SiteFooter /></div>
    </div>
  );
}
