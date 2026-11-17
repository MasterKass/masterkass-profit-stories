import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteFooter } from "@/components/home-sections";
import { BackHome } from "@/components/back-home";
import { PULSE_EVENTS, PULSE_TOPICS, type PulseTopic } from "@/lib/pulse";

export const Route = createFileRoute("/pulse")({
  head: () => ({
    meta: [
      { title: "Пульс регулирования · Мастер Касс" },
      { name: "description", content: "Хроника законов о кассах, маркировке, ЕГАИС, Меркурии, НДС и ЭЦП с 2016 года понятным языком." },
      { property: "og:title", content: "Пульс регулирования · Мастер Касс" },
      { property: "og:description", content: "Что менялось для касс и бизнеса — от 54-ФЗ до разрешительного режима." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PulsePage,
});

function PulsePage() {
  const [topic, setTopic] = useState<PulseTopic | "all">("all");
  const list = [...PULSE_EVENTS].reverse().filter((e) => topic === "all" || e.topic === topic);
  return (
    <div className="mk-page mk-dark-page min-h-screen">
      <BackHome showLogin />
      <main className="mx-auto max-w-4xl px-5 pb-20 pt-10">
        <section className="mt-12 max-w-3xl">
          <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] md:text-6xl"><span className="mk-bonus-title">Пульс регулирования</span></h1>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--mk-muted)" }}>
            Законы, маркировка и требования к кассам понятным языком. Сверху — свежее, внизу — с чего всё начиналось.
          </p>
        </section>
        <div className="mk-pulse-track" role="list" aria-label="Шкала времени">
          {PULSE_EVENTS.map((e, i) => (
            <a key={e.title} role="listitem" href={`#ev-${i}`} className="mk-pulse-tick" data-topic={e.topic} data-now={e.now ? "" : undefined} title={e.title}>
              {(i === 0 || PULSE_EVENTS[i - 1].year !== e.year) && <span className="mk-pulse-tick-year">{e.year}</span>}
              <span className="mk-pulse-tick-dot" aria-hidden="true" />
              <span className="mk-pulse-tick-label">{e.title}</span>
            </a>
          ))}
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--mk-muted)" }}>{PULSE_EVENTS.length} изменений за 10 лет. Листайте шкалу и нажимайте на событие.</p>
        <div className="mk-pulse-filters" role="group" aria-label="Темы">
          <button type="button" aria-pressed={topic === "all"} onClick={() => setTopic("all")}>Все</button>
          {(Object.keys(PULSE_TOPICS) as PulseTopic[]).map((t) => (
            <button key={t} type="button" data-topic={t} aria-pressed={topic === t} onClick={() => setTopic(t)}>{PULSE_TOPICS[t]}</button>
          ))}
        </div>
        <div className="mk-pulse-grid">
          {list.map((e) => (
            <article key={e.title} id={`ev-${PULSE_EVENTS.indexOf(e)}`} className="mk-pulse-item" data-topic={e.topic} data-now={e.now ? "" : undefined}>
              <div className="mk-pulse-meta"><span>{e.date}</span><span className="mk-pulse-tag">{PULSE_TOPICS[e.topic]}</span>{e.now && <span className="mk-pulse-live">Действует сейчас</span>}</div>
              <h2>{e.title}</h2>
              <p>{e.text}</p>
              <details className="mk-pulse-more">
                <summary>Читать разбор</summary>
                {e.more?.map((m) => <p key={m}>{m}</p>)}
                <p className="mk-pulse-kassa"><b>На кассе:</b> {e.kassa}</p>
                {e.risk && <p className="mk-pulse-kassa"><b>Риски:</b> {e.risk}</p>}
                <p className="mk-pulse-kassa"><b>Мастер Касс:</b> следит за сроками, обновляет кассу и предупреждает в дайджесте заранее.</p>
              </details>
            </article>
          ))}
        </div>
        <p className="mt-10 text-sm" style={{ color: "var(--mk-muted)" }}>Клиенты Мастер Касс получают новости по своим темам в утренний дайджест.</p>
      </main>
      <div className="px-4 pb-6"><SiteFooter /></div>
    </div>
  );
}
