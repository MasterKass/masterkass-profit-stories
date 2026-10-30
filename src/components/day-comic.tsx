import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BrandMark } from "@/components/brand-mark";
import f1 from "@/assets/comic-f1.jpg";
import f2 from "@/assets/comic-f2.jpg";
import f3 from "@/assets/comic-f3.jpg";
import f4 from "@/assets/comic-f4.jpg";
import f5 from "@/assets/comic-f5.jpg";
import f6 from "@/assets/comic-f6.jpg";
import f7 from "@/assets/comic-f7.jpg";
import f8 from "@/assets/comic-f8.jpg";

type Bubble = { who: string; text: string; pos: string; tail?: "bl" | "br" | "tl" | "tr" };
type Panel = { img: string; alt: string; span: string; ratio: string; caption?: string; captionTop?: boolean; bubbles: Bubble[] };

const panels: Panel[] = [
  { img: f1, alt: "Директор открывает утренний отчёт на телефоне", span: "col-span-1 row-span-11 md:col-span-2 md:row-span-3", ratio: "aspect-square", caption: "08:30 · Отчёт директора на почте", bubbles: [] },
  { img: f2, alt: "Директор записывает голосовое сообщение Ане", span: "col-span-1 row-span-11 md:col-span-4 md:row-span-6", ratio: "aspect-square", bubbles: [] },
  { img: f3, alt: "Бариста получает голосовое сообщение", span: "col-span-1 row-span-7 md:col-span-6 md:row-span-6", ratio: "aspect-[3/2]", caption: "08:42 · Кофейня, до открытия", bubbles: [] },
  { img: f4, alt: "Бариста спрашивает ИИ-помощника, на экране эквалайзер", span: "col-span-1 row-span-7 md:col-span-2 md:row-span-3", ratio: "aspect-[3/2]", bubbles: [] },
  { img: f5, alt: "Бариста закрывает смену на кассе и благодарит ИИ-помощника", span: "col-span-1 row-span-7 md:col-span-4 md:row-span-6", ratio: "aspect-[3/2]", bubbles: [] },
  { img: f6, alt: "Директор говорит с бухгалтером о платежах", span: "col-span-1 row-span-11 md:col-span-2 md:row-span-3", ratio: "aspect-square", caption: "Директор получает календарь оплат", captionTop: true, bubbles: [] },
  { img: f8, alt: "Директор голосом просит ИИ проанализировать систему лояльности, на смартфоне графики роста", span: "col-span-1 row-span-7 md:col-span-6 md:row-span-6", ratio: "aspect-[3/2]", bubbles: [] },
  { img: f7, alt: "Гость заказывает флэт уайт, бариста спрашивает про карту постоянного клиента и про баллы", span: "col-span-1 row-span-7 md:col-span-6 md:row-span-6", ratio: "aspect-[3/2]", bubbles: [] },
];

export function DayComic() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="mk-card w-full text-left transition-transform active:scale-[0.99]" style={{ padding: "1.15rem 1.25rem", display: "flex", alignItems: "center", gap: "0.9rem" }}>
        <BrandMark size={30} />
        <span className="min-w-0 flex-1 text-[17px] font-semibold leading-tight tracking-[-0.02em] md:text-[24px]">Один день из жизни с сервисом Мастер Касс</span>
        <ArrowUp aria-hidden className="mk-cue-up size-5 shrink-0 md:size-6" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="mk-page max-h-[92vh] w-[96vw] max-w-4xl overflow-y-auto p-4 md:p-8" style={{ borderRadius: 16 }}>
          <DialogTitle className="sr-only">Один день с «Мастер Касс»</DialogTitle>
          <DialogDescription className="sr-only">Комикс о дне директора и бариста</DialogDescription>
          <ComicStory />
        </DialogContent>
      </Dialog>
    </>
  );
}

function ComicStory() {
  return (
    <section>
      <h2 className="pr-8 text-[1.6rem] font-semibold leading-[1.05] tracking-[-0.035em] md:text-4xl">Один день с «Мастер Касс»</h2>
      <p className="mt-3 text-[15px]" style={{ color: "var(--mk-muted)" }}>Утро директора и бариста без звонков в поддержку и паники.</p>
      <div className="mt-8 grid grid-cols-1 auto-rows-[30px] gap-2 md:grid-cols-6 md:auto-rows-[80px] md:gap-3 md:grid-flow-row-dense">
        {panels.map((p, i) => (
          <figure key={p.alt} className={`mk-comic-panel relative overflow-hidden border-[1.5px] ${p.span}`} style={{ borderColor: "var(--mk-fg)", borderRadius: 0, animationDelay: `${i * 90}ms` }}>
            <img src={p.img} alt={p.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[60%_top]" />
            <span className="absolute left-3 top-3 px-2 py-0.5 text-[11px] font-semibold" style={{ background: "var(--mk-fg)", color: "var(--mk-surface)", display: p.captionTop ? "none" : undefined }}>{i + 1}</span>
            {p.caption && (p.captionTop ? (
              <figcaption className="absolute left-1/2 top-0 w-max max-w-[92%] -translate-x-1/2 px-3 pt-[9px] pb-1.5 text-center text-[10px] font-semibold uppercase tracking-wide md:text-[11px]" style={{ borderBottom: "1.5px solid var(--mk-fg)", borderLeft: "1.5px solid var(--mk-fg)", borderRight: "1.5px solid var(--mk-fg)", background: "var(--mk-surface)" }}>{p.caption}</figcaption>
            ) : (
              <figcaption className="absolute bottom-0 left-0 px-3 py-1.5 text-[12px] font-medium uppercase tracking-wide" style={{ borderTop: "1.5px solid var(--mk-fg)", borderRight: "1.5px solid var(--mk-fg)", background: "#fff" }}>{p.caption}</figcaption>
            ))}
            {p.bubbles.map((b) => (
              <div key={b.text} className={`mk-bubble ${b.pos} text-[8.5px] md:text-[11px]`} data-tail={b.tail ?? "bl"}>
                                {b.text}
              </div>
            ))}
          </figure>
        ))}
      </div>
      <p className="mt-6 text-lg font-semibold tracking-[-0.02em]">Технологии работают сами. Директор спокоен, бизнес растёт.</p>
    </section>
  );
}
