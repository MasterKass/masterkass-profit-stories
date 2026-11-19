import { createFileRoute } from "@tanstack/react-router";

// «Смарт-терминалы пользователя Эвотор»: список касс клиента. Принимаем массив или { items: [...] }.
const s = (v: unknown) => (v == null || v === "" ? null : String(v).slice(0, 200));

export const Route = createFileRoute("/api/public/evotor/devices")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { checkToken } = await import("@/lib/mk-bonus");
        if (!checkToken(request)) return new Response("Unauthorized", { status: 401 });
        let b: any; try { b = await request.json(); } catch { return new Response("Bad JSON", { status: 400 }); }
        const list: any[] = Array.isArray(b) ? b : Array.isArray(b?.items) ? b.items : [b];
        const userId = s(request.headers.get("x-evotor-user-id") ?? b?.userId);
        const now = new Date().toISOString();
        const rows = list.slice(0, 500).map((d) => ({
          device_id: s(d?.uuid ?? d?.id), evotor_user_id: s(d?.userId) ?? userId, name: s(d?.name),
          store_id: s(d?.storeUuid ?? d?.storeId ?? d?.store_id), serial_number: s(d?.serialNumber ?? d?.serial_number ?? d?.imei),
          model: s(d?.model ?? d?.deviceModel), raw: d, updated_at: now,
        })).filter((r) => r.device_id);
        if (!rows.length) return Response.json({ ok: true, saved: 0 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("mk_devices").upsert(rows as never, { onConflict: "device_id" });
        if (error) return new Response("Error", { status: 500 });
        return Response.json({ ok: true, saved: rows.length });
      },
    },
  },
});
