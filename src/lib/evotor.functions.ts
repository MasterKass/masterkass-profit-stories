import { createServerFn } from "@tanstack/react-start";
import { fnLife, summarize, type EvotorDoc } from "./evotor";

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

// Тестовая касса: токен хранится только на сервере, браузер получает готовые цифры.
export const getEvotorCabinet = createServerFn({ method: "GET" }).handler(async () => {
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
    return {
      ok: true as const,
      fn: fnLife(summary.fnSerial, firstUse),
      store: store?.name ?? "Магазин",
      devices: devices.map((d) => ({ name: d.name, serial: d.serial_number, model: `Эвотор ${d.model}` })),
      summary,
    };
  } catch (e) {
    console.error("evotor sync failed", e);
    return { ok: false as const, error: "Эвотор сейчас не отвечает" };
  }
});
