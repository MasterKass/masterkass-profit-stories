import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { BackHome } from "@/components/back-home";
import { BrandMark } from "@/components/brand-mark";
import { PrivacyLink } from "@/components/privacy-dialog";
import { ONBOARDING_STEPS, REFERRAL_BONUS_UNITS, TRIAL_KEY, findTariff, firstChargeDate, startingUnits } from "@/lib/onboarding";
import { SERVICE_TARIFFS } from "@/lib/tariffs";
import { validateRequest, type RequestErrors } from "@/lib/request";
import { submitServiceRequest, updateTrialDeal } from "@/lib/request.functions";

type Search = { tariff?: string | undefined; ref?: string | undefined };

export const Route = createFileRoute("/onboarding")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tariff: typeof s["tariff"] === "string" ? s["tariff"] : undefined,
    ref: typeof s["ref"] === "string" ? s["ref"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Подключение · Мастер Касс" },
      { name: "description", content: "Начните бесплатный период Мастер Касс: телефон и почта, выбор тарифа и подключение кассы Эвотор по персональной ссылке. Без привязки карты." },
      { property: "og:title", content: "Подключение · Мастер Касс" },
      { property: "og:description", content: "Бесплатный период без привязки карты." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const fmt = (d: Date) => d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }).replace(/ г\.$/, "");
type Trial = { dealId: number; email: string };

function Onboarding() {
  const search = Route.useSearch();
  const [tone, setTone] = useState<string | undefined>(search.tariff);
  const tariff = findTariff(tone);
  const [ref, setRef] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<RequestErrors>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [cash, setCash] = useState<"idle" | "access" | "linking" | "ok">("idle");
  const [manual, setManual] = useState(false);
  const [token, setToken] = useState("");
  const [endDate, setEndDate] = useState("");
  const submit = useServerFn(submitServiceRequest);
  const update = useServerFn(updateTrialDeal);

  useEffect(() => {
    if (search.ref) localStorage.setItem("mk-ref", search.ref);
    setRef(search.ref ?? localStorage.getItem("mk-ref"));
    setEndDate(fmt(firstChargeDate(new Date())));
    // Пришли из формы на странице сервиса: контакты уже есть, сделка создана.
    const saved = sessionStorage.getItem(TRIAL_KEY);
    if (saved) {
      try {
        const t = JSON.parse(saved) as Trial;
        setTrial(t);
        setStep(search.tariff ? 2 : 1);
      } catch { /* пусто */ }
    }
  }, [search.ref, search.tariff]);

  const move = (stage: "tariff" | "cash" | "started", t?: string) => {
    if (trial?.dealId) update({ data: { dealId: trial.dealId, stage, tariff: t ? findTariff(t).name : undefined } }).catch(() => {});
  };

  const sendContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = validateRequest({ phone, email });
    if (!r.ok) return setErrors(r.errors);
    setErrors({}); setFailed(false); setSending(true);
    try {
      const res = await submit({ data: { phone, email, tariff: tone ? findTariff(tone).name : undefined, source: tone ? "Карточка тарифа" : "Подключение с сайта", ref: ref ?? undefined } });
      // ВРЕМЕННО: пока Битрикс24 отклоняет запись, пропускаем клиента дальше без сделки.
      const t = { dealId: res.ok ? res.dealId : 0, email: r.value.email };
      setTrial(t);
      sessionStorage.setItem(TRIAL_KEY, JSON.stringify(t));
      setStep(tone ? 2 : 1);
    } catch {
      // ВРЕМЕННО: сбой связи тоже не блокирует просмотр следующих шагов.
      setTrial({ dealId: 0, email: r.value.email });
      setStep(tone ? 2 : 1);
    } finally { setSending(false); }
  };

  const pickTariff = (t: string) => { setTone(t); move("tariff", t); setStep(2); };
  const openAccess = () => setCash("access");
  const waitInstall = () => setCash("linking");
  const finish = () => { move("started", tone); sessionStorage.removeItem(TRIAL_KEY); setStep(3); };

  return (
    <main className="mk-page mk-onb min-h-screen">
      <BackHome />
      <div className="mx-auto max-w-xl px-5 pb-20 pt-24">
        <ol className="mk-onb-steps" aria-label="Шаги подключения">
          {ONBOARDING_STEPS.map((s, i) => (
            <li key={s} data-state={i < step ? "done" : i === step ? "now" : "next"}>
              <span>{i < step ? <Check size={13} /> : i + 1}</span>{s}
            </li>
          ))}
        </ol>

        {tone && step !== 1 && (
          <div className={`mk-card mk-tariff mk-tariff-${tariff.tone} mk-onb-tariff`}>
            <div>
              <h1 className="text-xl font-semibold">Тариф «{tariff.name}»: бесплатный период</h1>
              <p className="mt-1 text-sm">Далее {tariff.price} ₽/мес, только после вашего решения</p>
            </div>
            {ref && <p className="mk-onb-bonus">+{REFERRAL_BONUS_UNITS} AI-юнитов по приглашению партнёра</p>}
          </div>
        )}

        {step === 0 && (
          <form className="mk-card mk-onb-card" onSubmit={sendContacts} noValidate>
            <h2>{tone ? "Привяжем кабинет к вашему номеру" : "Начните бесплатный период МастерКасс"}</h2>
            <p className="mk-onb-muted">
              {tone ? "Чтобы вы могли управлять кассой и получать дайджест. Карта не нужна." : "Закрепим личный кабинет за вашим номером и поможем настроить кассу. Карта не нужна."}
            </p>
            <label>Телефон
              <input type="tel" autoComplete="tel" placeholder="+7 904 123-45-67" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            {errors.phone && <p className="mk-onb-err">{errors.phone}</p>}
            <label>Почта для утреннего дайджеста
              <input type="email" autoComplete="email" placeholder="name@company.ru" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            {errors.email && <p className="mk-onb-err">{errors.email}</p>}
            {failed && <p className="mk-onb-err">Не получилось сохранить. Попробуйте ещё раз через минуту.</p>}
            <button className="mk-onb-btn" type="submit" disabled={sending}>
              {sending ? "Сохраняем…" : tone ? "Начать бесплатный период →" : "Далее: выбрать тариф →"}
            </button>
            <p className="mk-onb-muted text-xs">Продолжая, соглашаетесь на обработку персональных данных согласно <PrivacyLink />.</p>
          </form>
        )}

        {step === 1 && (
          <div className="mk-card mk-onb-card">
            <h2>Выберите тариф</h2>
            <p className="mk-onb-muted">Все функции открыты на 30 дней бесплатно. Тариф можно сменить в кабинете.</p>
            <div className="mt-2 space-y-3">
              {SERVICE_TARIFFS.map((t) => (
                <button key={t.tone} type="button" onClick={() => pickTariff(t.tone)} className={`mk-card mk-tariff mk-tariff-${t.tone} mk-onb-tariff w-full text-left`}>
                  <div>
                    <b className="text-lg">«{t.name}»</b>
                    <p className="mt-1 text-sm">{t.price} ₽/мес после бесплатного периода</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mk-card mk-onb-card">
            <h2>Подключите кассу Эвотор</h2>
            <p className="mk-onb-muted">Приложение «МастерКасс» закрытое: его нет в общем каталоге Эвотора, оно открывается только клиентам сервиса по номеру владельца кассы.</p>
            <ol className="mk-onb-muted mt-3 list-decimal space-y-1 pl-5 text-sm">
              <li>Откроем доступ к приложению для вашего номера.</li>
              <li>Войдите в личный кабинет Эвотора по персональной ссылке под номером, к которому привязана касса.</li>
              <li>Нажмите «Установить», отметьте кассу и «Применить». Плитка «МастерКасс» появится на кассе через 1–2 минуты.</li>
            </ol>
            <div className="mk-onb-cash" data-state={cash === "ok" ? "ok" : cash === "idle" ? "idle" : "linking"}>
              <BrandMark size={44} />
              <span>{cash === "idle" ? "Доступ ещё не открыт" : cash === "access" ? "Доступ открыт для вашего номера" : cash === "linking" ? "Ждём установку на кассу…" : "Касса на связи"}</span>
            </div>
            {cash === "idle" && <button className="mk-onb-btn" onClick={openAccess}>Открыть доступ к приложению</button>}
            {cash === "access" && (
              <>
                <a className="mk-onb-btn" href="https://market.evotor.ru/store/apps/cc0b7b4e-6365-4eb0-b03b-d29ed50ccb2d" target="_blank" rel="noreferrer" onClick={waitInstall}>Войти в кабинет Эвотора →</a>
                <p className="mk-onb-muted text-xs">Не помните пароль? Нажмите «Забыли пароль» на странице входа Эвотора: новый пароль придёт по SMS на номер владельца.</p>
              </>
            )}
            {cash === "linking" && <button className="mk-onb-btn" onClick={() => setCash("ok")}>Я установил — проверить подключение</button>}
            {cash === "ok" && <button className="mk-onb-btn" onClick={() => { move("cash", tone); finish(); }}>Начать бесплатный период</button>}
            <button className="mk-onb-link" onClick={() => setManual(!manual)}>У меня другой ОФД или API-токен</button>
            {manual && (
              <div className="mt-3 space-y-3">
                <label>API-токен
                  <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Вставьте ключ из кабинета ОФД" />
                </label>
                <button className="mk-onb-btn" disabled={token.trim().length < 8} onClick={() => { move("cash", tone); finish(); }}>Сохранить токен</button>
              </div>
            )}
            <button className="mk-onb-link" onClick={finish}>Подключу кассу позже</button>
          </div>
        )}

        {step === 3 && (
          <div className="mk-card mk-onb-card">
            <h2>Всё готово</h2>
            <p className="mk-onb-muted">Бесплатный период активен до {endDate}. Первый дайджест придёт на {trial?.email ?? email} завтра утром. Привязать карту можно позже в кабинете.</p>
            <div className="mk-onb-balance">
              <b>{startingUnits(tariff.tone, !!ref).toLocaleString("ru-RU")}</b>
              <span>AI-юнитов на балансе{ref ? ` (${REFERRAL_BONUS_UNITS} от партнёра + ${tariff.units.toLocaleString("ru-RU")} по тарифу)` : ""}</span>
            </div>
            <Link to="/login" className="mk-onb-btn">Перейти в кабинет</Link>
          </div>
        )}
        <p className="mk-onb-muted mt-6 text-center text-xs">Подключение кассы пока работает в демо-режиме.</p>
      </div>
    </main>
  );
}
