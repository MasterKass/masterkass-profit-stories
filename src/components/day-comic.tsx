import f1 from "@/assets/comic-f1.jpg";
import f2 from "@/assets/comic-f2.jpg";
import f3 from "@/assets/comic-f3.jpg";
import f4 from "@/assets/comic-f4.jpg";
import f5 from "@/assets/comic-f5.jpg";
import f6 from "@/assets/comic-f6.jpg";
import f7 from "@/assets/comic-f7.jpg";
import f8 from "@/assets/comic-f8.jpg";

type Bubble = { who: string; text: string; pos: string; tail?: "bl" | "br" | "tl" | "tr" };
type Panel = { img: string; alt: string; r: number; caption?: string; captionTop?: boolean; bubbles: Bubble[] };

const p1: Panel = { img: f1, alt: "Директор открывает утренний отчёт на телефоне", r: 1, caption: "08:30 · Отчёт директора на почте", bubbles: [] };
const p2: Panel = { img: f2, alt: "Директор записывает голосовое сообщение Ане", r: 1, bubbles: [] };
const p3: Panel = { img: f3, alt: "Бариста получает голосовое сообщение", r: 1.5, caption: "08:42 · Кофейня, до открытия", bubbles: [] };
const p4: Panel = { img: f4, alt: "Бариста спрашивает ИИ-помощника, на экране эквалайзер", r: 1.5, bubbles: [] };
const p5: Panel = { img: f5, alt: "Бариста закрывает смену на кассе и благодарит ИИ-помощника", r: 1.5, bubbles: [] };
const p6: Panel = { img: f6, alt: "Директор говорит с бухгалтером о платежах", r: 1, caption: "Директор получает календарь оплат", captionTop: true, bubbles: [] };
const p7: Panel = { img: f8, alt: "Директор голосом просит ИИ проанализировать систему лояльности, на смартфоне графики роста", r: 1.5, bubbles: [] };
const p8: Panel = { img: f7, alt: "Гость заказывает флэт уайт, бариста спрашивает про карту постоянного клиента и про баллы", r: 1.5, bubbles: [] };

/* Журнальные строки: разная крупность и разное число панелей в строке, порядок чтения слева направо и сверху вниз */
const rows: Panel[][] = [[p1, p2], [p3, p4], [p5, p6], [p7], [p8]];

const badge = new Map(rows.flat().map((p, i) => [p.alt, i + 1]));

export function DayComic() {
  return (
    <section>
      <h2 className="pr-8 text-[1.6rem] font-semibold leading-[1.05] tracking-[-0.035em] md:text-4xl">Один день с «Мастер Касс»</h2>
      <p className="mt-3 text-[15px]" style={{ color: "var(--mk-muted)" }}>Утро директора и бариста без звонков в поддержку и паники.</p>
      <div className="mt-8 flex flex-col gap-2 md:gap-3">
        {rows.map((row, ri) => (
          <div key={ri} className="mk-comic-row">
            {row.map((p) => (
              <figure
                key={p.alt}
                className="mk-comic-panel relative overflow-hidden border-[1.5px]"
                style={{ borderColor: "var(--mk-fg)", borderRadius: 0, animationDelay: `${(badge.get(p.alt) ?? 1) * 90}ms`, ["--r" as string]: String(p.r) } as React.CSSProperties}
              >
                <img src={p.img} alt={p.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <span className={`absolute top-3 px-2 py-0.5 text-[11px] font-semibold ${p.captionTop ? "right-3" : "left-3"}`} style={{ background: "var(--mk-fg)", color: "var(--mk-surface)" }}>{badge.get(p.alt)}</span>
                {p.caption && (p.captionTop ? (
                  <figcaption className="absolute left-1/2 top-0 w-max max-w-[92%] -translate-x-1/2 px-3 pt-[9px] pb-1.5 text-center text-[10px] font-semibold uppercase tracking-wide md:text-[11px]" style={{ borderBottom: "1.5px solid var(--mk-fg)", borderLeft: "1.5px solid var(--mk-fg)", borderRight: "1.5px solid var(--mk-fg)", background: "var(--mk-surface)" }}>{p.caption}</figcaption>
                ) : (
                  <figcaption className="absolute bottom-0 left-0 px-3 py-1.5 text-[12px] font-medium uppercase tracking-wide" style={{ borderTop: "1.5px solid var(--mk-fg)", borderRight: "1.5px solid var(--mk-fg)", background: "#fff" }}>{p.caption}</figcaption>
                ))}
                {p.bubbles.map((b) => (
                  <div key={b.text} className={`mk-bubble ${b.pos} text-[8.5px] md:text-[11px]`} data-tail={b.tail ?? "bl"}>{b.text}</div>
                ))}
              </figure>
            ))}
          </div>
        ))}
      </div>
      <p className="mt-6 text-lg font-semibold tracking-[-0.02em]">Технологии работают сами. Директор спокоен, бизнес растёт.</p>
    </section>
  );
}
