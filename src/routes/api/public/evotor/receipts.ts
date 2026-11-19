import { createFileRoute } from "@tanstack/react-router";

// Приём чеков из «Эвотор» (настройка «Чеки (ver.2)»). Эвотор присылает «Ваш токен» в заголовке Authorization.
export const Route = createFileRoute("/api/public/evotor/receipts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["EVOTOR_WEBHOOK_TOKEN"];
        const auth = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
        if (!secret || auth !== secret) return new Response("Unauthorized", { status: 401 });
        const { ReceiptSchema, bonusMove } = await import("@/lib/evotor-receipt");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        let body: unknown;
        try { body = await request.json(); } catch { return new Response("Bad JSON", { status: 400 }); }
        const list = Array.isArray(body) ? body : [body];
        let moves = 0, failed = 0;
        for (const raw of list.slice(0, 500)) {
          const p = ReceiptSchema.safeParse(raw);
          if (!p.success) continue;
          const m = bonusMove(p.data);
          if (!m) continue;
          const d = p.data.data;
          const at = d.dateTime && !isNaN(Date.parse(d.dateTime)) ? new Date(d.dateTime).toISOString() : null;
          const { error } = await supabaseAdmin.rpc("mk_apply_bonus", {
            p_receipt_id: d.id ?? p.data.id, p_guest_key: m.guest, p_points: m.points,
            p_amount: d.totalAmount ?? 0, p_evotor_user_id: p.data.userId ?? null as unknown as string,
            p_store_id: d.storeId ?? null as unknown as string, p_receipt_at: at as unknown as string,
          });
          if (error) { failed++; console.error("mk-bonus save failed", error.message); } else moves++;
        }
        // Эвотору важен ответ 200; при сбое базы просим повторить (500), повтор не задвоит баллы.
        if (failed) return Response.json({ ok: false, failed }, { status: 500 });
        return Response.json({ ok: true, received: list.length, moves });
      },
    },
  },
});
