import f1 from "@/assets/comic-f1.jpg";
import f2 from "@/assets/comic-f2.jpg";
import f3 from "@/assets/comic-f3.jpg";
import f4 from "@/assets/comic-f4.jpg";
import f5 from "@/assets/comic-f5.jpg";
import f6 from "@/assets/comic-f6.jpg";
import f7 from "@/assets/comic-f7.jpg";

type Bubble = { who: string; text: string; pos: string; tail?: "bl" | "br" | "tl" | "tr" };
type Panel = { img: string; alt: string; span: string; ratio: string; caption?: string; bubbles: Bubble[] };

const panels: Panel[] = [
  { img: f1, alt: "Директор открывает утренний отчёт на телефоне", span: "col-span-1 row-span-3 md:col-span-2 md:row-span-4", ratio: "aspect-square", caption: "08:30 · Отчёт директора на почте", bubbles: [] },
  { img: f2, alt: "Директор записывает голосовое сообщение", span: "col-span-1 row-span-3 md:col-span-4 md:row-span-4", ratio: "aspect-square", bubbles: [
    { who: "Артём", text: "Аня, доброе утро! Смену вчера не закрыли — закрой, пожалуйста, перед началом работы. Как это сделать, спроси у ИИ-помощника.", pos: "right-[3%] top-[4%] w-[46%]", tail: "bl" },
  ] },
  { img: f3, alt: "Бариста получает голосовое сообщение", span: "col-span-2 row-span-2 md:col-span-6 md:row-span-4", ratio: "aspect-[3/2]", caption: "08:42 · Кофейня, до открытия", bubbles: [] },
  { img: f4, alt: "Бариста спрашивает ИИ-помощника, на экране эквалайзер", span: "col-span-1 row-span-3 md:col-span-2 md:row-span-5", ratio: "aspect-square", bubbles: [] },
  { img: f5, alt: "Бариста закрывает смену на кассе", span: "col-span-1 row-span-3 md:col-span-4 md:row-span-5", ratio: "aspect-square", bubbles: [
    { who: "Аня", text: "Спасибо, всё получилось!", pos: "left-[56%] top-[3%] w-[30%]", tail: "bl" },
    { who: "ИИ-помощник", text: "Я рад! Отличного дня и хороших чаевых.", pos: "left-[3%] top-[40%] w-[34%]", tail: "br" },
  ] },
  { img: f6, alt: "Директор говорит с бухгалтером", span: "col-span-2 row-span-3 md:col-span-4 md:row-span-4", ratio: "aspect-square", bubbles: [
    { who: "Артём", text: "Ирина, сегодня платежи — всё успеваем провести?", pos: "left-[2%] top-[2%] w-[36%]", tail: "br" },
    { who: "Ирина", text: "Да, Артём, всё вижу — сегодня оплатим.", pos: "right-[2%] top-[2%] w-[36%]", tail: "bl" },
  ] },
  { img: f7, alt: "Чашка кофе на стойке", span: "col-span-2 row-span-2 md:col-span-2 md:row-span-4", ratio: "aspect-square", bubbles: [
    { who: "Гость", text: "Флэт уайт, пожалуйста!", pos: "right-[4%] top-[4%] w-[42%]", tail: "bl" },
    { who: "Аня", text: "С бонусами по номеру?", pos: "left-[4%] bottom-[5%] w-[40%]", tail: "tr" },
  ] },
];

export function DayComic() {
  return (
    <section className="mt-8">
      <h2 className="text-[2rem] font-semibold leading-[1.05] tracking-[-0.035em] md:text-5xl">Один день с «Мастер Касс»</h2>
      <p className="mt-3 text-[15px]" style={{ color: "var(--mk-muted)" }}>Утро директора и бариста — без звонков в поддержку и паники.</p>
      <div className="mt-8 grid grid-cols-2 auto-rows-[88px] grid-flow-row-dense gap-2 md:grid-cols-6 md:auto-rows-[80px] md:gap-3">
        {panels.map((p, i) => (
          <figure key={p.alt} className={`mk-comic-panel relative overflow-hidden border-[1.5px] ${p.span}`} style={{ borderColor: "var(--mk-fg)", borderRadius: 0, animationDelay: `${i * 90}ms` }}>
            <img src={p.img} alt={p.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
            <span className="absolute left-3 top-3 px-2 py-0.5 text-[11px] font-semibold" style={{ background: "var(--mk-fg)", color: "var(--mk-surface)", display: p.bubbles.some((b) => b.pos.includes("left-3 top-3")) ? "none" : undefined }}>{i + 1}</span>
            {p.caption && (
              <figcaption className="absolute bottom-0 left-0 px-3 py-1.5 text-[12px] font-medium uppercase tracking-wide" style={{ borderTop: "1.5px solid var(--mk-fg)", borderRight: "1.5px solid var(--mk-fg)", background: "#fff" }}>{p.caption}</figcaption>
            )}
            {p.bubbles.map((b) => (
              <div key={b.text} className={`mk-bubble ${b.pos} text-[8.5px] md:text-[11px]`} data-tail={b.tail ?? "bl"}>
                                {b.text}
              </div>
            ))}
          </figure>
        ))}
      </div>
      <p className="mt-6 text-lg font-semibold tracking-[-0.02em]">Технологии работают сами — директор спокоен, бизнес растёт.</p>
    </section>
  );
}
