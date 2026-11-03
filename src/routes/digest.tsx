import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BackHome } from "@/components/back-home";
import { BrandMark } from "@/components/brand-mark";

export const Route = createFileRoute("/digest")({
  head: () => ({
    meta: [
      { title: "Утренний дайджест · Мастер Касс" },
      { name: "description", content: "Просмотр утреннего письма директору: выручка, заметка финдиректора, лояльность, касса, фонд и AI-юниты." },
      { property: "og:title", content: "Утренний дайджест · Мастер Касс" },
      { property: "og:description", content: "Как выглядит утреннее письмо директору." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Digest,
});

function Digest() {
  const [wide, setWide] = useState(false);
  return (
    <main className="mk-page mk-cab min-h-screen">
      <BackHome />
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-24">
        <div className="mk-dg-toolbar">
          <p className="mk-cab-muted">Пример письма · демо-данные</p>
          <div className="mk-dg-switch" role="group" aria-label="Размер экрана">
            <button type="button" aria-pressed={!wide} onClick={() => setWide(false)}>Телефон</button>
            <button type="button" aria-pressed={wide} onClick={() => setWide(true)}>Ноутбук</button>
          </div>
        </div>

        <article className="mk-dg-mail" data-wide={wide}>
          <header className="mk-dg-head">
            <div className="flex items-center gap-3">
              <BrandMark />
              <div>
                <p className="mk-cab-title">Кофейня «Утро»</p>
                <p className="mk-cab-muted">Вторник, 3 ноября · смена закрыта в 22:04</p>
              </div>
            </div>
            <p className="mk-dg-status">Смена закрыта штатно, Z-отчёт передан в ОФД, накопитель в норме.</p>
          </header>

          <section className="mk-card mk-cab-pulse">
            <p className="mk-cab-kicker">Выручка вчера</p>
            <p className="mk-cab-big">48 650 ₽</p>
            <p className="mk-cab-up">+12% к прошлому понедельнику</p>
            <dl className="mk-cab-stats">
              <div><dt>Чеков</dt><dd>73</dd></div>
              <div><dt>Средний чек</dt><dd>665 ₽</dd></div>
              <div><dt>План месяца</dt><dd>82%</dd></div>
            </dl>
            <p className="mk-dg-note">Чтобы выполнить план, нужно 54 000 ₽ в день до конца месяца.</p>
          </section>

          <section className="mk-card mk-dg-block">
            <p className="mk-cab-kicker">Заметка финансового директора</p>
            <p>Вчера день вытянул вечер: с 18:00 до 21:00 прошла почти половина выручки, а напитки с высокой наценкой дали лучший средний чек за неделю.</p>
            <p>Слабое место прежнее: с 14:00 до 16:00 всего 6 чеков. Если сохраните вчерашний темп, месяц закроется примерно на 96% плана.</p>
            <p className="mk-dg-action">На сегодня: предложите дневной комбо «кофе + десерт» с 14:00 до 16:00.</p>
          </section>

          <section className="mk-card mk-dg-block">
            <p className="mk-cab-kicker">Лояльность и возвращаемость гостей</p>
            <dl className="mk-cab-rows mk-dg-rows">
              <div><dt>Новые карты вчера</dt><dd>5</dd></div>
              <div><dt>Доля выручки от участников</dt><dd>44%</dd></div>
              <div><dt>Средний чек участника / гостя</dt><dd>620 ₽ / 390 ₽</dd></div>
              <div><dt>Баллы: начислено / списано</dt><dd>1 240 / 860</dd></div>
            </dl>
            <p className="mk-dg-action">32 постоянных гостя не были больше трёх недель. Напоминание может вернуть около 28 000 ₽ выручки.</p>
          </section>

          <section className="mk-card mk-dg-block">
            <p className="mk-cab-kicker">Касса и фонд «Новая касса»</p>
            <dl className="mk-cab-rows mk-dg-rows">
              <div><dt>Фискальный накопитель</dt><dd>ещё 45 дней</dd></div>
              <div><dt>В фонде «Новая касса»</dt><dd>14 250 ₽</dd></div>
              <div><dt>До замены оборудования</dt><dd>11 месяцев</dd></div>
            </dl>
          </section>

          <section className="mk-card mk-dg-block mk-dg-offer">
            <p className="mk-cab-kicker">Возможность автоматизации</p>
            <p>Оплата по QR через СБП: комиссия около 0,4% вместо 1,9% на эквайринге. Для вашего оборота это примерно 18 000 ₽ экономии в месяц.</p>
            <p className="mk-cab-muted">Показываем 1-2 раза в неделю. Цифры примерные.</p>
          </section>

          <footer className="mk-dg-foot">
            <p><b>1 300 AI-юнитов</b> на аналитику. Кассиры спрашивают AI бесплатно 24/7.</p>
            <Link to="/cabinet" className="mk-dg-btn">Открыть кабинет</Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
