import f1 from "@/assets/comic-f1.jpg";
import f2 from "@/assets/comic-f2.jpg";
import f3 from "@/assets/comic-f3.jpg";
import f4 from "@/assets/comic-f4.jpg";
import f5 from "@/assets/comic-f5.jpg";
import f6 from "@/assets/comic-f6.jpg";
import f7 from "@/assets/comic-f7.jpg";

type Bubble = { who: string; text: string; pos: string };
type Panel = { img: string; alt: string; span: string; ratio: string; caption?: string; bubbles: Bubble[] };

const panels: Panel[] = [
  { img: f1, alt: "Директор открывает утренний отчёт на телефоне", span: "col-span-1 row-span-3 md:col-span-2 md:row-span-4", ratio: "aspect-square", caption: "08:30 · Утренний отчёт уже на почте", bubbles: [] },
  { img: f2, alt: "Директор записывает голосовое сообщение", span: "col-span-1 row-span-3 md:col-span-4 md:row-span-4", ratio: "aspect-square", bubbles: [
    { who: "Артём", text: "Аня, доброе утро! Смену вчера не закрыли — закрой, пожалуйста, перед началом работы. Как это сделать, спроси у ИИ-помощника.", pos: "left-3 right-3 bottom-3" },
  ] },
  { img: f3, alt: "Бариста получает голосовое сообщение", span: "col-span-2 row-span-2 md:col-span-6 md:row-span-4", ratio: "aspect-[3/2]", caption: "08:42 · Кофейня, до открытия", bubbles: [] },
  { img: f4, alt: "Бариста спрашивает ИИ-помощника, на экране эквалайзер", span: "col-span-1 row-span-3 md:col-span-2 md:row-span-5", ratio: "aspect-square", bubbles: [] },
  { img: f5, alt: "Бариста закрывает смену на кассе", span: "col-span-1 row-span-3 md:col-span-4 md:row-span-5", ratio: "aspect-square", bubbles: [
    { who: "Аня", text: "Спасибо, всё получилось!", pos: "left-3 top-3 max-w-[70%]" },
    { who: "ИИ-помощник", text: "Я рад! Отличного дня и хороших чаевых.", pos: "right-3 bottom-3 max-w-[70%]" },
  ] },
  { img: f6, alt: "Директор говорит с бухгалтером", span: "col-span-2 row-span-3 md:col-span-4 md:row-span-4", ratio: "aspect-square", bubbles: [
    { who: "Артём", text: "Ирина, сегодня платежи — всё успеваем провести?", pos: "left-3 top-3 max-w-[48%]" },
    { who: "Ирина", text: "Да, Артём, всё вижу — сегодня оплатим.", pos: "right-3 bottom-3 max-w-[48%]" },
  ] },
  { img: f7, alt: "Чашка кофе на стойке", span: "col-span-2 row-span-2 md:col-span-2 md:row-span-4", ratio: "aspect-square", bubbles: [
    { who: "Гость", text: "Флэт уайт, пожалуйста!", pos: "left-3 top-3 max-w-[80%]" },
    { who: "Аня", text: "С бонусами по номеру?", pos: "right-3 bottom-3 max-w-[80%]" },
  ] },
];

export function DayComic() {
  return (
    <section className="mt-8">
      <h2 className="text-[2rem] font-semibold leading-[1.05] tracking-[-0.035em] md:text-5xl">Один день с «Мастер Касс»</h2>
      <p className="mt-3 text-[15px]" style={{ color: "var(--mk-muted)" }}>Утро директора и бариста — без звонков в поддержку и паники.</p>
      <div className="mt-8 grid grid-cols-2 auto-rows-[88px] grid-flow-row-dense gap-2 md:grid-cols-6 md:auto-rows-[80px] md:gap-3">
        {panels.map((p, i) => (
          <figure key={p.alt} className={`mk-comic-panel relative overflow-hidden rounded-2xl border ${p.span}`} style={{ borderColor: "var(--mk-fg)", animationDelay: `${i * 90}ms` }}>
            <img src={p.img} alt={p.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute left-3 top-3 rounded-lg px-2 py-0.5 text-[11px] font-semibold" style={{ background: "var(--mk-fg)", color: "var(--mk-surface)", display: p.bubbles.some((b) => b.pos.includes("left-3 top-3")) ? "none" : undefined }}>{i + 1}</span>
            {p.caption && (
              <figcaption className="absolute bottom-3 left-3 rounded-lg px-3 py-1.5 text-[12px] font-medium" style={{ background: "var(--mk-surface)", border: "1px solid var(--mk-fg)" }}>{p.caption}</figcaption>
            )}
            {p.bubbles.map((b) => (
              <div key={b.text} className={`absolute ${b.pos} rounded-2xl px-3 py-2 text-[13px] leading-snug shadow-sm`} style={{ background: "var(--mk-surface)", border: "1px solid var(--mk-fg)" }}>
                <span className="block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--mk-muted)" }}>{b.who}</span>
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
