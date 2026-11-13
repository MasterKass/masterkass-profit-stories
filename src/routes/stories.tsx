import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/home-sections";
import { BackHome } from "@/components/back-home";
import cafe from "@/assets/team-cafe.jpg";
import florist from "@/assets/team-florist.jpg";
import bakery from "@/assets/team-bakery.jpg";
import salon from "@/assets/team-salon.jpg";

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "Истории клиентов · Мастер Касс" },
      { name: "description", content: "Истории предпринимателей, которые доверили кассы сервису Мастер Касс: от одной кофейни до сети из шести точек." },
      { property: "og:title", content: "Истории клиентов · Мастер Касс" },
      { property: "og:description", content: "Как владелец кофейни вырос из одной точки до шести вместе с Мастер Касс." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StoriesPage,
});

const story: { h?: string; p: string }[] = [
  { h: "Две инжирины на «ход ноги»", p: "Когда я ещё жил в Израиле и ходил на шук (так называется рынок), я подходил к одному и тому же торговцу каждую неделю. Началось всё с небольшого бонуса: двух инжирин на «ход ноги». Это мило и ни к чему не обязывает. Но в следующий раз я сразу пошёл к знакомому прилавку. Тогда я понял силу отношений." },
  { h: "Первая кофейня", p: "Открывая свою первую кофейню, я твёрдо знал: систему лояльности сделаю обязательно. Но рутина владельца маленькой точки, чеки, отчёты, сбои, договоры, съела всё время. До бонусов руки так и не дошли. Через год я закрылся." },
  { h: "Второй шанс", p: "Когда я прочитал, как сейчас используют инструменты кассы для лояльности, огонь вспыхнул снова. Я решил начать заново, но уже понимал: мне нужен надёжный помощник. Я сразу подключил весь сервис Мастер Касс с ИИ-сотрудником. Это меня освободило, и в первый же месяц я занялся бонусной программой для гостей." },
  { h: "Шесть кофеен", p: "С каждым месяцем я видел устойчивый рост. Я сосредоточился на качестве продукта, а не на судорожном поиске новых клиентов. Сейчас мы с партнёрами открыли ещё пять кофеен, готовим выход в другие регионы и запуск франшизы." },
];

const more = [
  { img: bakery, tag: "Пекарня", t: "История пекарни", d: "Скоро расскажем" },
  { img: florist, tag: "Цветочный салон", t: "История цветочного салона", d: "Скоро расскажем" },
  { img: salon, tag: "Парикмахерская", t: "История салона красоты", d: "Скоро расскажем" },
];

function StoriesPage() {
  return (
    <div className="mk-page min-h-screen">
      <BackHome showLogin />
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-10">
        <p className="mt-12 text-sm uppercase tracking-[0.12em]" style={{ color: "var(--mk-muted)" }}>Истории клиентов</p>
        <h1 className="mt-3 max-w-3xl text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.03em] md:text-5xl">
          Как бариста подружил ИИ с кассой и вырастил из одной точки сеть кофеен
        </h1>
        <img src={cafe} alt="Владелец кофейни с командой" className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover" />
        <p className="mt-3 text-sm" style={{ color: "var(--mk-muted)" }}>Владелец сети кофеен · 6 точек · Ростов-на-Дону</p>
        <article className="mx-auto mt-12 max-w-2xl">
          {story.map((s) => (
            <section key={s.h} className="mb-10">
              <h2 className="text-2xl font-semibold tracking-[-0.02em]">{s.h}</h2>
              <p className="mt-3 text-lg leading-relaxed">{s.p}</p>
            </section>
          ))}
          <blockquote className="my-14 text-2xl font-semibold leading-snug tracking-[-0.02em] md:text-3xl">
            <span className="mk-bonus-title">«Личные отношения с гостем плюс сильный продукт: это неуязвимая комбинация».</span>
          </blockquote>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/loyalty" className="mk-outline">О программе МК Бонус</Link>
            <Link to="/onboarding" className="mk-outline">Попробовать бесплатно</Link>
          </div>
        </article>
        <h2 className="mk-h2 mt-24 text-center">Другие истории</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {more.map((m) => (
            <div key={m.t} className="mk-card overflow-hidden rounded-2xl">
              <img src={m.img} alt={m.tag} className="aspect-[4/3] w-full object-cover" />
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.1em]" style={{ color: "var(--mk-muted)" }}>{m.tag}</p>
                <p className="mt-2 text-lg font-semibold">{m.t}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--mk-muted)" }}>{m.d}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
