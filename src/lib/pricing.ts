export type TariffId = "standard" | "marking" | "egais";

// Ориентировочные цены за 1 кассу в месяц (заглушки — уточнить у команды)
export const TARIFFS: { id: TariffId; name: string; for: string; base: number; features: string[] }[] = [
  { id: "standard", name: "Стандарт", for: "Услуги, кофейни, розница без маркировки", base: 1500,
    features: ["Мониторинг сроков ФН и ОФД 24/7", "Безлимитная поддержка кассиров и владельца", "Бесплатный AI-наставник для обучения", "Плановые работы мастера без сюрпризов"] },
  { id: "marking", name: "Маркировка", for: "Одежда, обувь, вода, молочка — «Честный знак»", base: 2400,
    features: ["Всё из тарифа «Стандарт»", "Поддержка разрешительного режима", "Обновления под требования «Честного знака»", "Настройка 2D-сканера и ЭДО"] },
  { id: "egais", name: "ЕГАИС и подакциз", for: "Пиво, алкоголь, табак", base: 3200,
    features: ["Всё из тарифа «Маркировка»", "Сопровождение УТМ и связи с ЕГАИС", "Помощь со сверкой остатков", "Приоритетная линия дежурного инженера"] },
];

export const REGISTER_TIERS = [
  { label: "1 касса", min: 1, discount: 0 },
  { label: "2–3 кассы", min: 2, discount: 0.1 },
  { label: "4–9 касс", min: 4, discount: 0.15 },
  { label: "10+ касс · сеть", min: 10, discount: 0.2 },
];

export function discountFor(registers: number): number {
  let d = 0;
  for (const t of REGISTER_TIERS) if (registers >= t.min) d = t.discount;
  return d;
}

export function pricePerRegister(base: number, registers: number): number {
  return Math.round((base * (1 - discountFor(registers))) / 10) * 10;
}
