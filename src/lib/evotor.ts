// Чистые расчёты по документам Эвотора: без сети, чтобы их можно было проверить тестом.

export type EvotorDoc = {
  type: string;
  close_date: string;
  time_zone_offset?: number;
  body?: {
    result_sum?: number;
    payments?: { type: string; sum: number }[];
    pos_print_results?: { fn_serial_number?: string; kkt_reg_number?: string }[];
  };
};

export type EvotorSummary = {
  day: string | null; // дата последнего торгового дня, YYYY-MM-DD по местному времени
  revenue: number;
  cash: number;
  card: number;
  receipts: number;
  refunds: number;
  avgCheck: number;
  sessionOpen: boolean;
  lastEventAt: string | null;
  fnSerial: string | null;
  kktReg: string | null;
};

// Срок службы ФН по серии номера (первые 4 цифры). Неизвестная серия: срок не угадываем.
// 738x: ФН-1.1М на 36 месяцев, 728x: ФН-1.1М на 15 месяцев. Требует сверки с паспортом ФН.
export function fnTermMonths(serial: string | null): number | null {
  if (!serial) return null;
  if (/^738\d/.test(serial)) return 36;
  if (/^728\d/.test(serial)) return 15;
  return null;
}

export type FnLife = { since: string; until: string; daysLeft: number; months: number };

// Начало отсчёта: первый фискальный документ с этим ФН (на день позже регистрации или в тот же день).
export function fnLife(serial: string | null, firstUse: string | null, now = Date.now()): FnLife | null {
  const months = fnTermMonths(serial);
  if (!months || !firstUse) return null;
  const start = new Date(firstUse);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + months);
  const daysLeft = Math.floor((end.getTime() - now) / 86400000);
  return { since: start.toISOString().slice(0, 10), until: end.toISOString().slice(0, 10), daysLeft, months };
}

/** За сколько дней до конца срока ФН предупреждаем директора и ставим задачу в CRM. */
export const FN_ALERT_DAYS = 30;

export function fnNeedsAlert(fn: FnLife | null): boolean {
  return !!fn && fn.daysLeft <= FN_ALERT_DAYS;
}

/** Связь кассы по «тишине»: сколько часов от кассы не было документов. Порог блокировки ФН — 30 дней без передачи в ОФД. */
export type LinkStatus = { level: "ok" | "warn" | "alert"; hours: number; label: string };

export function linkStatus(lastEventAt: string | null, now = Date.now()): LinkStatus | null {
  if (!lastEventAt) return null;
  const hours = Math.max(0, Math.floor((now - Date.parse(lastEventAt)) / 3600000));
  const days = Math.floor(hours / 24);
  if (hours < 24) return { level: "ok", hours, label: hours < 1 ? "на связи, данные меньше часа назад" : `на связи, данные ${hours} ч назад` };
  if (days < 7) return { level: "warn", hours, label: `нет данных ${days} дн.` };
  return { level: "alert", hours, label: `нет данных ${days} дн.` };
}

const round = (n: number) => Math.round(n * 100) / 100;

function localDay(d: EvotorDoc) {
  const ms = Date.parse(d.close_date) + (d.time_zone_offset ?? 10800000);
  return new Date(ms).toISOString().slice(0, 10);
}

export function summarize(docs: EvotorDoc[]): EvotorSummary {
  const sorted = [...docs].sort((a, b) => Date.parse(a.close_date) - Date.parse(b.close_date));
  const sales = sorted.filter((d) => d.type === "SELL" || d.type === "PAYBACK");
  const lastSale = sales[sales.length - 1];
  const day = lastSale ? localDay(lastSale) : null;
  let revenue = 0, cash = 0, card = 0, receipts = 0, refunds = 0;
  for (const d of sales) {
    if (localDay(d) !== day) continue;
    const sign = d.type === "PAYBACK" ? -1 : 1;
    if (sign > 0) receipts++; else refunds++;
    revenue += sign * (d.body?.result_sum ?? 0);
    for (const p of d.body?.payments ?? []) {
      if (p.type === "CASH") cash += sign * p.sum; else card += sign * p.sum;
    }
  }
  let sessionOpen = false;
  for (const d of sorted) {
    if (d.type === "OPEN_SESSION") sessionOpen = true;
    if (d.type === "CLOSE_SESSION") sessionOpen = false;
  }
  let fnSerial: string | null = null, kktReg: string | null = null;
  for (const d of sorted) {
    const p = d.body?.pos_print_results?.[0];
    if (p?.fn_serial_number) fnSerial = p.fn_serial_number;
    if (p?.kkt_reg_number) kktReg = p.kkt_reg_number.trim();
  }
  return {
    day, revenue: round(revenue), cash: round(cash), card: round(card), receipts, refunds,
    avgCheck: receipts ? round(revenue / receipts) : 0, sessionOpen,
    lastEventAt: sorted[sorted.length - 1]?.close_date ?? null, fnSerial, kktReg,
  };
}

/** Задача в CRM на плановую замену ФН: прозвон, счёт, оплата, выезд инженера. */
export function fnReplacementTask(p: { fn: FnLife; fnSerial: string; store: string; kkt: string | null; test?: boolean }) {
  const until = new Date(`${p.fn.until}T12:00:00Z`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  const deadline = new Date(Date.parse(`${p.fn.until}T12:00:00Z`) - 7 * 86400000).toISOString().slice(0, 10);
  const steps = [
    "Созвон с клиентом: предупредить об окончании срока ФН и предварительно согласовать выставление счёта.",
    "Выставить организации счёт на новый ФН и работы по замене, отправить на почту.",
    "Проконтролировать оплату счёта.",
    "Через 1–2 недели после созвона согласовать точную дату и час выезда инженера, вне пиковых часов торговли.",
    "Выезд инженера: закрыть архив старого ФН, установить новый, перерегистрировать ККТ в ФНС и ОФД, пробить тестовый чек.",
  ];
  return {
    title: `${p.test ? "[ТЕСТ] " : ""}Замена ФН: ${p.store}, до ${until}`,
    deadline,
    steps,
    description: [
      `Точка: ${p.store}`,
      p.kkt ? `ККТ: ${p.kkt}` : null,
      `ФН № ${p.fnSerial}, срок ${p.fn.months} мес., до ${until} (осталось ${p.fn.daysLeft} дн.)`,
      "",
      ...steps.map((s, i) => `${i + 1}. ${s}`),
    ].filter((x) => x !== null).join("\n"),
  };
}

/** Касса молчит 7 дней и дольше: сразу ставим задачу в CRM, не дожидаясь блокировки ФН на 30-й день. */
export const LINK_TASK_DAYS = 7;
export function linkNeedsTask(link: LinkStatus | null): boolean {
  return !!link && link.hours >= LINK_TASK_DAYS * 24;
}

export function linkSilenceTask(p: { store: string; device: string; days: number; test?: boolean; now?: number }) {
  const left = Math.max(0, 30 - p.days);
  const deadline = new Date((p.now ?? Date.now()) + 86400000).toISOString().slice(0, 10);
  const steps = [
    "Позвонить на точку: проверить интернет (Wi-Fi, SIM-карта, баланс) и включена ли касса.",
    "Помочь кассиру вернуть кассу в сеть и убедиться, что неотправленные чеки ушли в ОФД.",
    "Если удалённо не получилось, согласовать выезд инженера до блокировки ФН.",
  ];
  return {
    title: `${p.test ? "[ТЕСТ] " : ""}Касса не на связи ${p.days} дн.: ${p.store}`,
    deadline,
    description: [
      `Точка: ${p.store}`, `Касса: ${p.device}`,
      `Нет данных ${p.days} дн. До блокировки ФН (30 дней без ОФД) осталось около ${left} дн.`, "",
      ...steps.map((s, i) => `${i + 1}. ${s}`),
    ].join("\n"),
  };
}
