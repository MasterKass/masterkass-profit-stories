// Серверные помощники Эвотора и Битрикс24: токены только здесь, браузер их не видит.
import { fnLife, linkNeedsTask, linkSilenceTask, linkStatus, summarize, type EvotorDoc } from "./evotor";

const API = "https://api.evotor.ru";

const fnStartCache = new Map<string, string>();
const hasFn = (d: EvotorDoc, fn: string) =>
  d.body?.pos_print_results?.some((p) => p.fn_serial_number === fn) ?? false;

// Ищем первый документ с этим ФН: идём по месяцам назад, пока ФН встречается.
async function findFnFirstUse(storeId: string, fn: string, headers: Record<string, string>) {
  const cached = fnStartCache.get(fn);
  if (cached) return cached;
  const now = new Date();
  let earliest: string | null = null;
  for (let back = 0; back < 40; back++) {
    const from = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1);
    const to = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back + 1, 1);
    let url = `${API}/stores/${storeId}/documents?since=${from}&until=${to}`;
    let found: string | null = null, any = false;
    for (let i = 0; i < 6 && url && !found; i++) {
      const r = await fetch(url, { headers });
      if (!r.ok) return earliest;
      const j = await r.json();
      const items = (j.items ?? []) as EvotorDoc[];
      if (items.length) any = true;
      const hit = items.filter((d) => hasFn(d, fn)).sort((a, b) => Date.parse(a.close_date) - Date.parse(b.close_date))[0];
      if (hit) found = hit.close_date;
      const c = j.paging?.next_cursor;
      url = c ? `${API}/stores/${storeId}/documents?cursor=${encodeURIComponent(c)}` : "";
    }
    if (found) earliest = found;
    else if (earliest && any) break; // в этом месяце работал прежний ФН
  }
  if (earliest) fnStartCache.set(fn, earliest);
  return earliest;
}

export async function loadCabinet() {
  const token = process.env["EVOTOR_TEST_TOKEN"];
  if (!token) return { ok: false as const, error: "Касса не подключена" };
  const headers = { "X-Authorization": token, Accept: "*/*" };
  try {
    const [storesRes, devicesRes] = await Promise.all([
      fetch(`${API}/stores`, { headers }),
      fetch(`${API}/devices`, { headers }),
    ]);
    if (!storesRes.ok || !devicesRes.ok) throw new Error(`evotor ${storesRes.status}/${devicesRes.status}`);
    const stores = (await storesRes.json()).items as { id: string; name: string }[];
    const devices = (await devicesRes.json()).items as { id: string; name: string; serial_number: string; model: string }[];
    const store = stores[0];
    const docs: EvotorDoc[] = [];
    if (store) {
      const since = Date.now() - 14 * 86400000;
      let url = `${API}/stores/${store.id}/documents?since=${since}`;
      for (let i = 0; i < 10 && url; i++) {
        const r = await fetch(url, { headers });
        if (!r.ok) throw new Error(`documents ${r.status}`);
        const j = await r.json();
        docs.push(...(j.items ?? []));
        const cursor = j.paging?.next_cursor;
        url = cursor ? `${API}/stores/${store.id}/documents?cursor=${encodeURIComponent(cursor)}` : "";
      }
    }
    const summary = summarize(docs);
    const firstUse = store && summary.fnSerial ? await findFnFirstUse(store.id, summary.fnSerial, headers) : null;
    // Последние события для AI-диагностики: только тип и время, без сумм и покупателей.
    const events = [...docs]
      .sort((a, b) => Date.parse(b.close_date) - Date.parse(a.close_date))
      .slice(0, 15)
      .map((d) => ({ type: d.type, at: d.close_date }));
    return {
      ok: true as const,
      fn: fnLife(summary.fnSerial, firstUse),
      store: store?.name ?? "Магазин",
      devices: devices.map((d) => ({ name: d.name, serial: d.serial_number, model: `Эвотор ${d.model}` })),
      summary,
      events,
    };
  } catch (e) {
    console.error("evotor sync failed", e);
    return { ok: false as const, error: "Эвотор сейчас не отвечает" };
  }
}

export function bitrixRoot() {
  const base = process.env["BITRIX24_WEBHOOK_URL"];
  return base ? base.replace(/\/?$/, "/") : null;
}

// Есть ли уже задача с таким названием за последние сутки. Битрикс24 сам служит
// журналом отправок, поэтому дублей нет даже между разными запусками сервера.
async function recentTaskExists(root: string, title: string) {
  const since = new Date(Date.now() - 24 * 3600000).toISOString();
  const r = await fetch(root + "tasks.task.list.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter: { "%TITLE": title, ">=CREATED_DATE": since }, select: ["ID"] }),
  });
  const j = (await r.json().catch(() => null)) as { result?: { tasks?: unknown[] } } | null;
  return (j?.result?.tasks?.length ?? 0) > 0;
}

export type LinkCheckResult =
  | { ok: true; id: string; days: number }
  | { ok: false; reason: "no_bitrix" | "no_data" | "online" | "duplicate" | "bitrix_error"; error: string; days?: number };

/** Проверка «касса молчит 7+ дней» и постановка задачи. Общая для крона и кнопки в «Хозяине». */
export async function runLinkSilenceCheck(test: boolean): Promise<LinkCheckResult> {
  const root = bitrixRoot();
  if (!root) return { ok: false, reason: "no_bitrix", error: "Битрикс24 не подключён" };
  const cab = await loadCabinet();
  if (!cab.ok) return { ok: false, reason: "no_data", error: "Нет данных с кассы" };
  const link = linkStatus(cab.summary.lastEventAt);
  if (!link) return { ok: false, reason: "no_data", error: "Нет данных о связи кассы" };
  const days = Math.floor(link.hours / 24);
  if (!test && !linkNeedsTask(link)) return { ok: false, reason: "online", error: "Касса на связи, задача не нужна", days };
  const dev = cab.devices[0];
  const device = dev ? `${dev.model} (№ ${dev.serial})` : "касса";
  const t = linkSilenceTask({ store: cab.store, device, days, test });
  // Сравниваем по устойчивой части названия (без числа дней).
  const marker = `${test ? "[ТЕСТ] " : ""}Касса не на связи: ${cab.store}`;
  if (await recentTaskExists(root, marker)) return { ok: false, reason: "duplicate", error: "Задача уже создана за последние сутки", days };
  const responsible = Number(process.env["BITRIX24_RESPONSIBLE_ID"] ?? 1);
  const res = await fetch(root + "tasks.task.add.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: { TITLE: t.title, DESCRIPTION: t.description, RESPONSIBLE_ID: responsible, DEADLINE: `${t.deadline}T18:00:00+03:00` } }),
  });
  const j = (await res.json().catch(() => null)) as { result?: { task?: { id?: string } }; error?: string } | null;
  const taskId = j?.result?.task?.id;
  if (res.ok && taskId) return { ok: true, id: String(taskId), days };
  console.error("Bitrix24 link task error", res.status, j?.error);
  return { ok: false, reason: "bitrix_error", error: "Битрикс24 не принял задачу", days };
}
