import { useState } from "react";
import d1 from "@/assets/comic-d1.jpg";
import d2 from "@/assets/comic-d2.jpg";
import d3 from "@/assets/comic-d3.jpg";
import d4 from "@/assets/comic-d4.jpg";
import k1 from "@/assets/comic-k1.jpg";
import k2 from "@/assets/comic-k2.jpg";
import k3 from "@/assets/comic-k3.jpg";
import k4 from "@/assets/comic-k4.jpg";

type Panel = { time: string; title: string; img: string; who: string; line: string; note: string };

const director: Panel[] = [
  { time: "08:30", title: "Кофе и утренний отчёт", img: d1, who: "Директор", line: "Так, на второй точке не закрыта вчерашняя смена. Сейчас напишу Ане.", note: "Утренний PDF на почте заранее предупреждает о риске блокировки кассы." },
  { time: "08:40", title: "Голосовое бухгалтеру", img: d2, who: "Директор", line: "Марина, доброе утро! Сегодня по графику оплата сервисов на кассе — успеваем?", note: "Сумма и дата платежей уже посчитаны в отчёте — никаких внезапных отключений." },
  { time: "14:30", title: "Идея с бонусами", img: d3, who: "Директор", line: "Цифры сходятся. Давай запустим!", note: "AI-помощник за минуты считает экономику бонусов, запуск — по SMS-коду." },
  { time: "21:30", title: "Спокойный вечер", img: d4, who: "Директор", line: "Смены закрыты, выручка учтена. Отчёт будет утром.", note: "Без звонков и планёрок — время для семьи." },
];

const cashier: Panel[] = [
  { time: "08:42", title: "Сообщение от директора", img: k1, who: "Аня, бариста", line: "Ой, смена не закрыта… Сейчас спрошу у помощника.", note: "Директор пишет спокойно и коротко — помощник всё объяснит." },
  { time: "08:44", title: "Голосом — к AI-помощнику", img: k2, who: "AI-помощник", line: "Отчёты → Кассовый отчёт → Закрыть смену. Затем — Открыть смену. Штрафа не будет.", note: "15 секунд голосом, не отходя от кассы." },
  { time: "14:52", title: "Новая фраза для гостя", img: k3, who: "Аня, бариста", line: "Хотите, начислим 100 бонусов на десерт по номеру телефона?", note: "Готовый текст сам появился в телефоне — учить ничего не нужно." },
  { time: "21:05", title: "Смена закрыта", img: k4, who: "AI-помощник", line: "Все чеки переданы, расхождений нет. Отличная работа!", note: "Утром у директора в отчёте всё зелёное." },
];

export function DayComic() {
  const [tab, setTab] = useState<"d" | "k">("d");
  const panels = tab === "d" ? director : cashier;
  return (
    <section className="mt-24">
      <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">Один день с «Мастер Касс»</h2>
      <div className="mt-6 inline-flex rounded-xl border p-1" style={{ borderColor: "var(--mk-border)", background: "var(--mk-surface)" }}>
        {([["d", "День директора"], ["k", "День кассира"]] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className="rounded-[10px] px-4 py-2 text-sm font-medium transition-colors"
            style={tab === k ? { background: "var(--mk-ink)", color: "var(--mk-surface)" } : { color: "var(--mk-muted)" }}
          >
            {l}
          </button>
        ))}
      </div>
      <div key={tab} className="mt-8 grid gap-4 md:grid-cols-2">
        {panels.map((p, i) => (
          <article key={p.time} className="mk-comic-panel" style={{ animationDelay: `${i * 90}ms` }}>
            <div className="relative">
              <img src={p.img} alt={p.title} width={1024} height={768} loading="lazy" className="block w-full rounded-xl border" style={{ borderColor: "var(--mk-ink)" }} />
              <span className="absolute left-3 top-3 rounded-lg px-2 py-1 text-xs font-semibold" style={{ background: "var(--mk-surface)", border: "1px solid var(--mk-ink)" }}>{p.time}</span>
              <div className="mk-bubble">
                <span className="block text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--mk-muted)" }}>{p.who}</span>
                {p.line}
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em]">{p.title}</h3>
            <p className="mt-1 text-[14px] leading-relaxed" style={{ color: "var(--mk-muted)" }}>{p.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
