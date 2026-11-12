import { useState } from "react";
import { BE_TARIFFS, breakeven, cashMargin } from "@/lib/breakeven";

const EXP = ["ФОТ команды", "Офис и связь", "Серверы и сервисы", "Сервисный фонд"];
const rub = (n: number) => `${Math.round(n).toLocaleString("ru-RU")} ₽`;

export function BreakevenPanel() {
  const [exp, setExp] = useState([0, 0, 0, 0]);
  const [cnt, setCnt] = useState([0, 0, 0]);
  const [fundStart, setFundStart] = useState(0);
  const fundMonth = cnt.reduce((a, b) => a + b, 0) * 750;
  const r = breakeven(exp, cnt);
  const num = (v: string) => Math.max(0, Number(v.replace(/\D/g, "")) || 0);
  const field = "mt-1 w-full rounded-[10px] border border-border bg-background px-3 py-2 text-sm";
  return (
    <section className="mk-card mt-6 p-5">
      <h3 className="text-lg font-semibold">Пульс · Денежный поток · Точка безубыточности</h3>
      <p className="mt-1 text-sm text-muted-foreground">Внесите фактические расходы за месяц и число платных касс.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {EXP.map((l, i) => (
          <label key={l} className="text-xs text-muted-foreground">{l}
            <input inputMode="numeric" className={field} value={exp[i] || ""} placeholder="0"
              onChange={(e) => setExp(exp.map((v, j) => (j === i ? num(e.target.value) : v)))} />
          </label>
        ))}
      </div>
      <p className="mt-2 text-sm">Постоянные расходы: <b>{rub(r.fixed)}</b> в месяц</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {BE_TARIFFS.map((t, i) => (
          <label key={t.name} className="text-xs text-muted-foreground">Касс на «{t.name}»
            <input inputMode="numeric" className={field} value={cnt[i] || ""} placeholder="0"
              onChange={(e) => setCnt(cnt.map((v, j) => (j === i ? num(e.target.value) : v)))} />
          </label>
        ))}
      </div>
      <div className="mt-4 rounded-[12px] bg-muted p-4 text-sm">
        <div>Маржинальный доход: <b>{rub(r.income)}</b> в месяц</div>
        <div className="mt-1 text-base font-semibold">
          {r.balance >= 0 ? `Прибыль: +${rub(r.balance)} в месяц. Точка безубыточности пройдена` : `Дефицит: −${rub(-r.balance)} в месяц`}
        </div>
      </div>
      <div className="mt-4 rounded-[12px] border border-border p-4 text-sm">
        <div className="font-semibold">Фонд «Новая касса»</div>
        <div className="mt-1">За месяц: <b>{rub(fundMonth)}</b> (750 ₽ × {cnt.reduce((a, b) => a + b, 0)} касс)</div>
        <label className="mt-2 block text-xs text-muted-foreground">Накоплено на начало месяца
          <input inputMode="numeric" className={field} value={fundStart || ""} placeholder="0"
            onChange={(e) => setFundStart(num(e.target.value))} />
        </label>
        <div className="mt-2">С нарастающим итогом: <b>{rub(fundStart + fundMonth)}</b></div>
        <div className="mt-1 text-xs text-muted-foreground">Этих денег хватит на {Math.floor((fundStart + fundMonth) / 27000)} новых касс по 27 000 ₽. Фонд не входит в прибыль сервиса.</div>
      </div>
      {r.balance < 0 && (
        <ul className="mt-4 space-y-2 text-sm">
          {BE_TARIFFS.map((t, i) => (
            <li key={t.name}>Добрать <b>{r.need[i]}</b> касс на «{t.name}» ({rub(t.price)} · маржа {rub(cashMargin(t))} с кассы)</li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted-foreground">Маржа кассы = абонплата − фонд «Новая касса» 750 ₽ − AI-юниты тарифа. Любой из трёх вариантов закрывает дефицит.</p>
    </section>
  );
}
