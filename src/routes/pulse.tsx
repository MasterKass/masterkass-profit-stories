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
  let lastYear = 0;
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
        <div className="mk-pulse-filters" role="group" aria-label="Темы">
          <button type="button" aria-pressed={topic === "all"} onClick={() => setTopic("all")}>Все</button>
          {(Object.keys(PULSE_TOPICS) as PulseTopic[]).map((t) => (
            <button key={t} type="button" data-topic={t} aria-pressed={topic === t} onClick={() => setTopic(t)}>{PULSE_TOPICS[t]}</button>
          ))}
        </div>
        <ol className="mk-pulse-line">
          {list.map((e) => {
            const showYear = e.year !== lastYear; lastYear = e.year;
            return (
              <li key={e.title}>
                {showYear && <div className="mk-pulse-year">{e.year}</div>}
                <article className="mk-pulse-item" data-topic={e.topic} data-now={e.now ? "" : undefined}>
                  <span className="mk-pulse-dot" aria-hidden="true" />
                  <div className="mk-pulse-meta"><span>{e.date}</span><span className="mk-pulse-tag">{PULSE_TOPICS[e.topic]}</span>{e.now && <span className="mk-pulse-live">Действует сейчас</span>}</div>
                  <h2>{e.title}</h2>
                  <p>{e.text}</p>
                  <p className="mk-pulse-kassa"><b>На кассе:</b> {e.kassa}</p>
                </article>
              </li>
            );
          })}
        </ol>
        <p className="mt-10 text-sm" style={{ color: "var(--mk-muted)" }}>Клиенты Мастер Касс получают новости по своим темам в утренний дайджест.</p>
      </main>
      <div className="px-4 pb-6"><SiteFooter /></div>
    </div>
  );
}
