import { createServerFn } from "@tanstack/react-start";
import { summarize, type EvotorDoc } from "./evotor";

const API = "https://api.evotor.ru";

// Тестовая касса: токен хранится только на сервере, браузер получает готовые цифры.
export const getEvotorCabinet = createServerFn({ method: "GET" }).handler(async () => {
  const token = process.env["EVOTOR_TEST_TOKEN"];
  if (!token) return { ok: false as const, error: "Касса не подключена" };
  const headers = { "X-Authorization": token, Accept: "application/json" };
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
    return {
      ok: true as const,
      store: store?.name ?? "Магазин",
      devices: devices.map((d) => ({ name: d.name, serial: d.serial_number, model: `Эвотор ${d.model}` })),
      summary: summarize(docs),
    };
  } catch (e) {
    console.error("evotor sync failed", e);
    return { ok: false as const, error: "Эвотор сейчас не отвечает" };
  }
});
