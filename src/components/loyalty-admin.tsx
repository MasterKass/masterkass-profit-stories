import { useState } from "react";
import { Sparkles, Check, QrCode, Search } from "lucide-react";
import { DEFAULT_RULES, maxSpend, accrual, type LoyaltyRules } from "@/lib/loyalty";

const GUESTS = [
  { name: "Мария С.", phone: "+7 ··· 41-18", bal: 640, visits: 23, last: "сегодня", seg: "Постоянные" },
  { name: "Олег Д.", phone: "+7 ··· 07-52", bal: 210, visits: 2, last: "вчера", seg: "Новички" },
  { name: "Светлана К.", phone: "+7 ··· 93-60", bal: 1180, visits: 15, last: "42 дня назад", seg: "Спящие" },
  { name: "Игорь В.", phone: "+7 ··· 55-04", bal: 90, visits: 31, last: "сегодня", seg: "Постоянные" },
  { name: "Анна Л.", phone: "+7 ··· 12-77", bal: 200, visits: 1, last: "3 дня назад", seg: "Новички" },
];
const SEGS = ["Все", "Новички", "Постоянные", "Спящие"];
const FIELDS: [keyof LoyaltyRules, string, string][] = [
  ["welcome", "Приветственные баллы", "баллов"], ["cashbackPct", "Кешбэк с покупки", "%"],
  ["maxSpendPct", "Списание, не больше", "% чека"], ["burnDays", "Сгорание без покупок", "дней"],
];

export function LoyaltyAdmin() {
  const rules = DEFAULT_RULES;
  const [seg, setSeg] = useState("Все");
  const [q, setQ] = useState("");
  const [sent, setSent] = useState(false);
  const list = GUESTS.filter((g) => (seg === "Все" || g.seg === seg) && (g.name + g.phone).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mk-loy">
      <p className="mk-loy-note">Правила баллов — в разделе «Настройки».</p>
      <p className="mk-cab-kicker mt-5">Карта гостя в Wallet</p>
      <div className="mk-loy-wallet">
        <div className="mk-loy-card">
          <span>Кофейня «Утро» · МК Бонус</span>
          <b>640 баллов</b>
          <small>Мария С. · сгорят через {rules.burnDays} дн. без покупок</small>
          <QrCode size={44} aria-hidden="true" />
        </div>
        <div className="mk-loy-qr">
          <QrCode size={72} aria-hidden="true" />
          <p>QR для стойки: гость сканирует, даёт согласие и получает {rules.welcome} баллов.</p>
          <a href="/downloads/digest-utro.pdf" className="mk-cab-fnbtn" onClick={(e) => e.preventDefault()}>Скачать тейбл-тент (скоро)</a>
        </div>
      </div>

      <p className="mk-cab-kicker mt-5">Гости</p>
      <div className="mk-loy-segs">{SEGS.map((s) => <button type="button" key={s} data-on={s === seg} onClick={() => setSeg(s)}>{s}</button>)}</div>
      <label className="mk-loy-search"><Search size={16} aria-hidden="true" /><input placeholder="Имя или телефон" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      <ul className="mk-loy-list">
        {list.map((g) => <li key={g.name}><span><b>{g.name}</b><small>{g.phone} · {g.visits} визитов · {g.last}</small></span><em>{g.bal}</em></li>)}
        {!list.length && <li><small>Никого не нашли</small></li>}
      </ul>

      <div className="mk-loy-ai">
        <p><Sparkles size={14} aria-hidden="true" /> У 38 гостей не было визитов больше 30 дней, у них сгорает 8 400 баллов.</p>
        <button type="button" className="mk-cab-ask" onClick={() => setSent(true)} disabled={sent}>{sent ? "Напоминание отправлено в Wallet (демо)" : "Отправить push-напоминание"}</button>
      </div>
    </div>
  );
}

export function LoyaltySettings() {
  const [raw, setRaw] = useState<Record<keyof LoyaltyRules, string>>(() => Object.fromEntries(Object.entries(DEFAULT_RULES).map(([k, v]) => [k, String(v)])) as Record<keyof LoyaltyRules, string>);
  const rules: LoyaltyRules = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Number(v) || 0])) as LoyaltyRules;
  const [saved, setSaved] = useState(true);
  const spend = maxSpend(1000, 640, rules);
  return (
    <div className="mk-loy">
      <p className="mk-cab-kicker">Правила программы</p>
      <div className="mk-loy-rules">
        {FIELDS.map(([k, label, unit]) => (
          <label key={k}><span>{label}</span>
            <span className="mk-loy-in"><input type="text" inputMode="numeric" value={raw[k]} onChange={(e) => { setRaw({ ...raw, [k]: e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "") }); setSaved(false); }} />{unit}</span>
          </label>
        ))}
      </div>
      <p className="mk-loy-note">Пример: чек 1 000 ₽, на карте 640 баллов — можно списать {spend}, с оплаты {1000 - spend} ₽ начислится {accrual(1000 - spend, rules)}.</p>
      <button type="button" className="mk-cab-ask" onClick={() => setSaved(true)} disabled={saved}>
        <Check size={16} aria-hidden="true" />{saved ? "Сохранено · правила на кассе «МастерКасс Агент»" : "Сохранить и отправить на кассу"}
      </button>

      <p className="mk-cab-kicker mt-5">Кассы</p>
      <ul className="mk-loy-list">
        <li><span><b>Касса №1 · Эвотор 7.2</b><small>правила получены сегодня, 09:14</small></span><em>активна</em></li>
      </ul>
      <p className="mk-loy-note">Новую кассу привязать: откройте «МастерКасс Агент» и введите код 482 913 (демо).</p>
    </div>
  );
}
