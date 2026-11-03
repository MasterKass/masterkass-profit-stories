import { useState } from "react";
import { Bar, BarChart, Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

/** Демо-панели разделов пространства «Хозяин»: график, переключатель периода и таблица. Цифры вымышленные. */

type Period = "week" | "month";
type Row = { name: string; cells: string[] };
type Board = {
  kpis: (p: Period) => [string, string][];
  chartTitle: string;
  kind: "bar" | "area";
  series: (p: Period) => { label: string; a: number; b?: number }[];
  legend: [string, string?];
  head: string[];
  rows: Row[];
};

const W = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const M = ["1 нед", "2 нед", "3 нед", "4 нед"];

const BOARDS: Record<string, Board> = {
  Маркетинг: {
    kpis: (p) => p === "week"
      ? [["Заявки", "23"], ["Конверсия в клиента", "26%"], ["Цена заявки", "410 ₽"]]
      : [["Заявки", "94"], ["Конверсия в клиента", "24%"], ["Цена заявки", "460 ₽"]],
    chartTitle: "Заявки по дням",
    kind: "bar",
    series: (p) => (p === "week" ? W.map((l, i) => ({ label: l, a: [3, 5, 2, 4, 6, 2, 1][i]! })) : M.map((l, i) => ({ label: l, a: [19, 24, 27, 24][i]! }))),
    legend: ["Заявки"],
    head: ["Канал", "Заявки", "Клиенты", "Цена заявки"],
    rows: [
      { name: "Партнёры (рефералы)", cells: ["31", "11", "0 ₽"] },
      { name: "Яндекс Карты", cells: ["24", "5", "380 ₽"] },
      { name: "Рилсы и соцсети", cells: ["22", "4", "520 ₽"] },
      { name: "Сайт напрямую", cells: ["17", "3", "610 ₽"] },
    ],
  },
  Финансы: {
    kpis: (p) => p === "week"
      ? [["Подписки", "36 200 ₽"], ["Расходы", "21 900 ₽"], ["Маржа", "40%"]]
      : [["Подписки", "152 300 ₽"], ["Расходы", "94 100 ₽"], ["Маржа", "38%"]],
    chartTitle: "Подписки и расходы",
    kind: "area",
    series: (p) => (p === "week"
      ? W.map((l, i) => ({ label: l, a: [5.1, 5.4, 4.9, 5.6, 5.8, 4.8, 4.6][i]!, b: [3.1, 3.2, 3, 3.3, 3.4, 2.9, 3][i]! }))
      : M.map((l, i) => ({ label: l, a: [35, 37, 39, 41][i]!, b: [23, 24, 23, 24][i]! }))),
    legend: ["Подписки, тыс ₽", "Расходы, тыс ₽"],
    head: ["Тариф", "Клиентов", "В месяц", "Доля"],
    rows: [
      { name: "Просто · 1 950 ₽", cells: ["28", "54 600 ₽", "36%"] },
      { name: "Учёт · 3 850 ₽", cells: ["19", "73 150 ₽", "48%"] },
      { name: "Контроль · 5 650 ₽", cells: ["4", "22 600 ₽", "15%"] },
      { name: "Пробный месяц", cells: ["7", "0 ₽", "0%"] },
    ],
  },
  Интеграции: {
    kpis: (p) => p === "week"
      ? [["Подключено касс", "61"], ["Сбоев обмена", "3"], ["Время ответа", "1,2 с"]]
      : [["Подключено касс", "61"], ["Сбоев обмена", "11"], ["Время ответа", "1,4 с"]],
    chartTitle: "Сбои обмена данными",
    kind: "bar",
    series: (p) => (p === "week" ? W.map((l, i) => ({ label: l, a: [0, 1, 0, 0, 2, 0, 0][i]! })) : M.map((l, i) => ({ label: l, a: [4, 2, 2, 3][i]! }))),
    legend: ["Сбои"],
    head: ["Сервис", "Статус", "Точек", "Последний обмен"],
    rows: [
      { name: "Битрикс24", cells: ["работает", "58", "2 мин назад"] },
      { name: "Эвотор", cells: ["работает", "47", "5 мин назад"] },
      { name: "ОФД", cells: ["работает", "61", "1 мин назад"] },
      { name: "Честный знак", cells: ["настройка", "12", "вчера"] },
    ],
  },
  Сотрудники: {
    kpis: (p) => p === "week"
      ? [["Закрыто обращений", "48"], ["Среднее время", "37 мин"], ["Оценка клиентов", "4,8"]]
      : [["Закрыто обращений", "203"], ["Среднее время", "41 мин"], ["Оценка клиентов", "4,7"]],
    chartTitle: "Закрыто обращений",
    kind: "bar",
    series: (p) => (p === "week" ? W.map((l, i) => ({ label: l, a: [8, 9, 7, 10, 8, 4, 2][i]! })) : M.map((l, i) => ({ label: l, a: [47, 52, 55, 49][i]! }))),
    legend: ["Обращения"],
    head: ["Сотрудник", "Роль", "Обращений", "Оценка"],
    rows: [
      { name: "Денис И.", cells: ["интеграции", "34", "4,9"] },
      { name: "Инженер 1", cells: ["выезды", "71", "4,7"] },
      { name: "Инженер 2", cells: ["удалённо", "64", "4,8"] },
      { name: "ИИ-сотрудник", cells: ["первая линия", "1 280", "4,6"] },
    ],
  },
  Сервис: {
    kpis: (p) => p === "week"
      ? [["Мануалов в обучении", "14"], ["Решено ИИ без инженера", "82%"], ["Точность ответов", "91%"]]
      : [["Мануалов в обучении", "38"], ["Решено ИИ без инженера", "79%"], ["Точность ответов", "89%"]],
    chartTitle: "Решено ИИ-сотрудниками",
    kind: "bar",
    series: (p) => (p === "week" ? W.map((l, i) => ({ label: l, a: [41, 47, 39, 52, 58, 33, 24][i]! })) : M.map((l, i) => ({ label: l, a: [212, 236, 251, 268][i]! }))),
    legend: ["Обращения"],
    head: ["ИИ-сотрудник", "Формат", "Обучение", "Точность"],
    rows: [
      { name: "Nova", cells: ["голос", "в процессе", "88%"] },
      { name: "Наставник кассира", cells: ["текст", "готов", "93%"] },
      { name: "Диагностика сбоев", cells: ["текст", "в процессе", "86%"] },
      { name: "Помощник по лояльности", cells: ["текст", "черновик", "—"] },
    ],
  },
  Биллинг: {
    kpis: (p) => p === "week"
      ? [["Юнитов потрачено", "18 400"], ["Токенов", "18,4 млн"], ["Себестоимость / выручка", "6 900 / 18 400 ₽"]]
      : [["Юнитов потрачено", "76 900"], ["Токенов", "76,9 млн"], ["Себестоимость / выручка", "28 700 / 76 900 ₽"]],
    chartTitle: "Юниты по дням, все клиенты",
    kind: "area",
    series: (p) => (p === "week"
      ? W.map((l, i) => ({ label: l, a: [2.6, 2.9, 2.4, 3.1, 3.3, 2.3, 1.8][i]!, b: [1, 1.1, 0.9, 1.2, 1.2, 0.9, 0.6][i]! }))
      : M.map((l, i) => ({ label: l, a: [17.2, 18.9, 19.6, 21.2][i]!, b: [6.4, 7, 7.3, 8][i]! }))),
    legend: ["Юниты, тыс", "Себестоимость, тыс ₽"],
    head: ["Клиент", "Тариф", "Потрачено / включено", "Остаток"],
    rows: [
      { name: "Кофейня «Утро»", cells: ["Учёт", "820 / 1 000", "180"] },
      { name: "Маркет «Южный»", cells: ["Контроль", "2 610 / 2 500", "докупка 500"] },
      { name: "Пекарня «Хлебница»", cells: ["Учёт", "640 / 1 000", "360"] },
      { name: "Студия «Форма»", cells: ["Просто", "290 / 300", "10"] },
      { name: "Цветы «Лаванда»", cells: ["Просто", "120 / 300", "180"] },
    ],
  },
};

export function OwnerBoard({ section }: { section: string }) {
  const [period, setPeriod] = useState<Period>("week");
  const [active, setActive] = useState<number | null>(null);
  const b = BOARDS[section];
  if (!b) return null;
  const data = b.series(period);

  return (
    <section className="mk-card mk-own-board" aria-label={`Показатели: ${section}`}>
      <div className="mk-own-board-top">
        <h2>{section}</h2>
        <div className="mk-dg-switch" role="group" aria-label="Период">
          <button type="button" aria-pressed={period === "week"} onClick={() => { setPeriod("week"); setActive(null); }}>Неделя</button>
          <button type="button" aria-pressed={period === "month"} onClick={() => { setPeriod("month"); setActive(null); }}>Месяц</button>
        </div>
      </div>

      <dl className="mk-own-kpis">
        {b.kpis(period).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>

      <p className="mk-own-sub">{b.chartTitle}</p>
      <div className="mk-own-chart">
        <ResponsiveContainer width="100%" height="100%">
          {b.kind === "bar" ? (
            <BarChart data={data} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--mk-border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
              <Tooltip cursor={{ fill: "var(--mk-border)" }} formatter={(v) => [v, b.legend[0]]} />
              <Bar dataKey="a" radius={[6, 6, 0, 0]} onClick={(_, i) => setActive(i === active ? null : i)}>
                {data.map((_, i) => <Cell key={i} fill={active === null || active === i ? "var(--mk-chart-1)" : "var(--mk-chart-mute)"} cursor="pointer" />)}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--mk-border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip separator="" formatter={(v) => [v, ""]} />
              <Area dataKey="a" stroke="var(--mk-chart-1)" fill="var(--mk-chart-1)" fillOpacity={0.35} strokeWidth={2} />
              <Area dataKey="b" stroke="var(--mk-chart-2)" fill="var(--mk-chart-2)" fillOpacity={0.25} strokeWidth={2} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
      <p className="mk-own-legend">
        <span data-c="1">{b.legend[0]}</span>
        {b.legend[1] && <span data-c="2">{b.legend[1]}</span>}
        {active !== null && <em>Выбрано: {data[active]?.label}, {data[active]?.a}</em>}
      </p>

      <div className="mk-own-table-wrap">
        <table className="mk-own-table">
          <thead><tr>{b.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {b.rows.map((r) => (
              <tr key={r.name}><td>{r.name}</td>{r.cells.map((c, i) => <td key={i}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
