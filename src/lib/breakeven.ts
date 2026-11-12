// Точка безубыточности: маржа кассы = абонплата − фонд «Новая касса» − AI-юниты (1 юнит ≈ 1 ₽).
export const FUND_PER_CASH = 750;
export const BE_TARIFFS = [
  { name: "Просто", price: 1950, units: 300 },
  { name: "Учёт", price: 3850, units: 1000 },
  { name: "Контроль", price: 5650, units: 2500 },
] as const;

export const cashMargin = (t: { price: number; units: number }) => t.price - FUND_PER_CASH - t.units;

/** counts: число платных касс по тарифам; expenses: 4 статьи постоянных расходов */
export function breakeven(expenses: number[], counts: number[]) {
  const fixed = expenses.reduce((s, v) => s + (v || 0), 0);
  const income = BE_TARIFFS.reduce((s, t, i) => s + cashMargin(t) * (counts[i] || 0), 0);
  const balance = income - fixed;
  const need = BE_TARIFFS.map((t) => (balance >= 0 ? 0 : Math.ceil(-balance / cashMargin(t))));
  return { fixed, income, balance, need };
}
