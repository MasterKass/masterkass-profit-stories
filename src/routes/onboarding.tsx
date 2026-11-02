import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { BackHome } from "@/components/back-home";
import { BrandMark } from "@/components/brand-mark";
import {
  ONBOARDING_STEPS,
  REFERRAL_BONUS_UNITS,
  findTariff,
  firstChargeDate,
  isValidCard,
  isValidEmail,
  startingUnits,
} from "@/lib/onboarding";

type Search = { tariff?: string; ref?: string };

export const Route = createFileRoute("/onboarding")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tariff: typeof s.tariff === "string" ? s.tariff : undefined,
    ref: typeof s.ref === "string" ? s.ref : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Подключение тарифа · Мастер Касс" },
      { name: "description", content: "Подключите тариф Мастер Касс самостоятельно: привязка карты, касса Эвотор и почта для утреннего дайджеста. Первый месяц бесплатно." },
      { property: "og:title", content: "Подключение тарифа · Мастер Касс" },
      { property: "og:description", content: "Три шага до первого утреннего дайджеста. Первый месяц бесплатно." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const fmt = (d: Date) => d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

function Onboarding() {
  const search = Route.useSearch();
  const tariff = findTariff(search.tariff);
  const [ref, setRef] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });
  const [cardErr, setCardErr] = useState("");
  const [cash, setCash] = useState<"idle" | "linking" | "ok">("idle");
  const [manual, setManual] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [chargeDate, setChargeDate] = useState("");

  useEffect(() => {
    if (search.ref) localStorage.setItem("mk-ref", search.ref);
    setRef(search.ref ?? localStorage.getItem("mk-ref"));
    setChargeDate(fmt(firstChargeDate(new Date())));
  }, [search.ref]);

  const bindCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidCard(card.number, card.exp, card.cvc)) return setCardErr("Проверьте номер карты, срок и CVC");
    setCardErr("");
    setStep(1);
  };
  const linkCash = () => {
    setCash("linking");
    setTimeout(() => setCash("ok"), 1400);
  };
  const saveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return setEmailErr("Укажите почту в формате name@company.ru");
    setEmailErr("");
    setStep(3);
  };

  return (
    <main className="mk-onb">
      <BackHome to="/service" />
      <div className="mx-auto max-w-xl px-5 pb-20 pt-24">
        <ol className="mk-onb-steps" aria-label="Шаги подключения">
          {ONBOARDING_STEPS.map((s, i) => (
            <li key={s} data-state={i < step ? "done" : i === step ? "now" : "next"}>
              <span>{i < step ? <Check size={13} /> : i + 1}</span>{s}
            </li>
          ))}
        </ol>

        <div className={`mk-card mk-tariff mk-tariff-${tariff.tone} mk-onb-tariff`}>
          <div>
            <h1 className="text-xl font-semibold">Тариф «{tariff.name}»</h1>
            <p className="mt-1 text-sm">{tariff.price} ₽/мес · первые 30 дней 0 ₽</p>
          </div>
          {ref && <p className="mk-onb-bonus">+{REFERRAL_BONUS_UNITS} AI-юнитов по приглашению партнёра</p>}
        </div>

        {step === 0 && (
          <form className="mk-card mk-onb-card" onSubmit={bindCard} noValidate>
            <h2>Привяжите карту</h2>
            <p className="mk-onb-muted">Бесплатный месяц начнётся сразу после привязки. Сейчас спишем 0 ₽.</p>
            <label>Номер карты
              <input inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={card.number}
                onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ") })} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>Срок
                <input inputMode="numeric" autoComplete="cc-exp" placeholder="ММ/ГГ" value={card.exp}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setCard({ ...card, exp: v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v }); }} />
              </label>
              <label>CVC
                <input inputMode="numeric" autoComplete="cc-csc" placeholder="000" type="password" value={card.cvc}
                  onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 3) })} />
              </label>
            </div>
            {cardErr && <p className="mk-onb-err">{cardErr}</p>}
            <button className="mk-onb-btn" type="submit">Привязать карту</button>
            <p className="mk-onb-muted text-xs">Первое списание {tariff.price} ₽ состоится {chargeDate}. Отключить подписку можно в любой момент в кабинете.</p>
          </form>
        )}

        {step === 1 && (
          <div className="mk-card mk-onb-card">
            <h2>Подключите кассу Эвотор</h2>
            <p className="mk-onb-muted">Установите приложение «Мастер Касс» в Эвотор.Маркете, и мы получим доступ без логинов и паролей.</p>
            <div className="mk-onb-cash" data-state={cash}>
              <BrandMark size={44} />
              <span>{cash === "idle" ? "Касса не подключена" : cash === "linking" ? "Связываемся с кассой…" : "Касса на связи"}</span>
            </div>
            {cash !== "ok" ? (
              <button className="mk-onb-btn" onClick={linkCash} disabled={cash === "linking"}>Подключить через Эвотор.Маркет</button>
            ) : (
              <button className="mk-onb-btn" onClick={() => setStep(2)}>Продолжить</button>
            )}
            <button className="mk-onb-link" onClick={() => setManual(!manual)}>У меня другой ОФД или API-токен</button>
            {manual && (
              <div className="mt-3 space-y-3">
                <label>API-токен
                  <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Вставьте ключ из кабинета ОФД" />
                </label>
                <button className="mk-onb-btn" disabled={token.trim().length < 8} onClick={() => setStep(2)}>Сохранить токен</button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <form className="mk-card mk-onb-card" onSubmit={saveEmail} noValidate>
            <h2>Почта для утреннего дайджеста</h2>
            <p className="mk-onb-muted">Каждое утро пришлём отчёт о выручке, чеках и оплатах за вчерашний день.</p>
            <label>Почта
              <input type="email" autoComplete="email" placeholder="name@company.ru" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            {emailErr && <p className="mk-onb-err">{emailErr}</p>}
            <button className="mk-onb-btn" type="submit">Сохранить</button>
          </form>
        )}

        {step === 3 && (
          <div className="mk-card mk-onb-card">
            <h2>Всё готово</h2>
            <p className="mk-onb-muted">Бесплатный месяц активен до {chargeDate}. Первый дайджест придёт на {email} завтра утром.</p>
            <div className="mk-onb-balance">
              <b>{startingUnits(tariff.tone, !!ref).toLocaleString("ru-RU")}</b>
              <span>AI-юнитов на балансе{ref ? ` (${REFERRAL_BONUS_UNITS} от партнёра + ${tariff.units.toLocaleString("ru-RU")} по тарифу)` : ""}</span>
            </div>
            <Link to="/login" className="mk-onb-btn">Перейти в кабинет</Link>
          </div>
        )}
        <p className="mk-onb-muted mt-6 text-center text-xs">Демо-режим: карта и данные кассы никуда не отправляются.</p>
      </div>
    </main>
  );
}
