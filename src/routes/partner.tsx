import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, CreditCard, FileText, QrCode, Users, Wallet } from "lucide-react";
import { BackHome } from "@/components/back-home";

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [
      { title: "Кабинет партнёра · Мастер Касс" },
      { name: "description", content: "Кабинет партнёра Мастер Касс: реферальная ссылка и QR-код, приглашённые клиенты, вознаграждения, вывод на карту и документы." },
      { property: "og:title", content: "Кабинет партнёра · Мастер Касс" },
      { property: "og:description", content: "Ссылка, клиенты и выплаты партнёра в одном окне." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Partner,
});

const LINK = "masterkass.ru/?ref=IVANOVA";

const CLIENTS = [
  { name: "Кофейня «Утро»", tariff: "Учёт", status: "Оплатил", reward: "2 000 ₽", paid: true },
  { name: "Цветы «Лаванда»", tariff: "Просто", status: "Оплатил", reward: "2 000 ₽", paid: true },
  { name: "Барбершоп «Борода»", tariff: "Контроль", status: "Бесплатный месяц", reward: "ждёт оплаты" },
  { name: "Магазин «У дома»", tariff: "Учёт", status: "Подключается", reward: "ждёт оплаты" },
];

const DOCS = [
  { name: "Договор-оферта партнёра", status: "Подписан" },
  { name: "Акт за октябрь", status: "Готов" },
];

function Partner() {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(`https://${LINK}`); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <main className="mk-page mk-cab min-h-screen">
      <BackHome />
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-24">
        <header className="mk-cab-head">
          <div>
            <p className="mk-cab-org">Елена Иванова</p>
            <p className="mk-cab-muted">Партнёр · бухгалтер-специалист</p>
          </div>
          <span className="mk-csh-status"><Check size={14} aria-hidden="true" />Договор подписан</span>
        </header>

        <section className="mk-card mk-acc-block" aria-label="Вознаграждения">
          <p className="mk-cab-kicker"><Wallet size={14} aria-hidden="true" />Вознаграждения</p>
          <ul className="mk-acc-list">
            <li><span className="mk-acc-name">Доступно к выводу</span><b>4 000 ₽</b></li>
            <li><span className="mk-acc-name">Ожидает первой оплаты клиентов</span><b>4 000 ₽</b></li>
            <li><span className="mk-acc-name">Выплачено за всё время</span><b>6 000 ₽</b></li>
          </ul>
          <button type="button" className="mk-login-btn mt-4" onClick={() => alert("Вывод на карту заработает после запуска")}>
            <CreditCard size={16} aria-hidden="true" />Вывести на карту
          </button>
        </section>

        <section className="mk-card mk-acc-block" aria-label="Ссылка и QR-код">
          <p className="mk-cab-kicker"><QrCode size={14} aria-hidden="true" />Ссылка и QR-код</p>
          <ul className="mk-acc-list">
            <li>
              <span className="mk-acc-name">{LINK}<small>2 000 ₽ за каждого клиента после первой оплаты</small></span>
              <button type="button" className="mk-csh-ibtn" aria-label="Скопировать ссылку" onClick={copy}>
                {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
              </button>
            </li>
          </ul>
        </section>

        <section className="mk-card mk-acc-block" aria-label="Приглашённые клиенты">
          <p className="mk-cab-kicker"><Users size={14} aria-hidden="true" />Приглашённые клиенты</p>
          <ul className="mk-acc-list">
            {CLIENTS.map((c) => (
              <li key={c.name}>
                <span className="mk-acc-name">{c.name}<small>«{c.tariff}» · {c.status}</small></span>
                <b className="mk-acc-date" data-soon={!c.paid}>{c.reward}</b>
              </li>
            ))}
          </ul>
        </section>

        <section className="mk-card mk-acc-block" aria-label="Документы">
          <p className="mk-cab-kicker"><FileText size={14} aria-hidden="true" />Договор и закрывающие документы</p>
          <ul className="mk-acc-list">
            {DOCS.map((d) => (
              <li key={d.name}><span className="mk-acc-name">{d.name}<small>{d.status}</small></span></li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
