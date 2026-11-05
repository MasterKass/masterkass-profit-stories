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
