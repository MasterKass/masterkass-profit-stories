import { createFileRoute } from "@tanstack/react-router";
import { BackHome } from "@/components/back-home";
import { SiteFooter } from "@/components/home-sections";
import { sections } from "@/lib/privacy-sections";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Политика обработки персональных данных · Мастер Касс" },
      { name: "description", content: "Как Мастер Касс собирает, хранит и защищает персональные данные: серверы в России, «Битрикс24», сроки обработки и отзыв согласия." },
      { property: "og:title", content: "Политика обработки персональных данных Мастер Касс" },
      { property: "og:description", content: "Какие данные мы собираем, зачем они нужны и как вы можете отозвать согласие." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});


function PrivacyPage() {
  return (
    <div className="mk-page min-h-screen">
      <BackHome destination="request" />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-12">
        <h1 className="text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.035em] md:text-5xl">
          Политика обработки персональных данных
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed" style={{ color: "var(--mk-muted)" }}>
          Оператор: Сервисный центр «Мастер Касс», город Ростов-на-Дону. Инфраструктура для работы с обращениями:
          «Битрикс24» (ООО «1С-Битрикс»), серверы на территории Российской Федерации.
        </p>

        <div className="mt-12 space-y-10">
          {sections.map((s) => (
            <section key={s.n} className="mk-card">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">{s.n}</h2>
              <ul className="mt-4 space-y-3 text-[15px] leading-relaxed" style={{ color: "var(--mk-muted)" }}>
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-[0.55em] size-[5px] shrink-0 rounded-full" style={{ background: "var(--mk-fg)" }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <div className="px-4 pb-6"><SiteFooter /></div>
    </div>
  );
}
