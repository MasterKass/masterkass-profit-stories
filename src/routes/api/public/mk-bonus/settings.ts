import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Процент списания баллов для клиента Эвотора: GET ?evotorUserId=..., POST {evotorUserId, percent}.
const B = z.object({ evotorUserId: z.string().trim().min(1).max(100), percent: z.number().int().min(0).max(100) });

export const Route = createFileRoute("/api/public/mk-bonus/settings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { checkToken, accountPercent } = await import("@/lib/mk-bonus");
        if (!checkToken(request)) return new Response("Unauthorized", { status: 401 });
        const id = new URL(request.url).searchParams.get("evotorUserId");
        if (!id) return new Response("Bad request", { status: 400 });
        return Response.json({ evotorUserId: id, percent: await accountPercent(id) });
      },
      POST: async ({ request }) => {
        const { checkToken } = await import("@/lib/mk-bonus");
        if (!checkToken(request)) return new Response("Unauthorized", { status: 401 });
        let raw: unknown; try { raw = await request.json(); } catch { return new Response("Bad JSON", { status: 400 }); }
        const p = B.safeParse(raw);
        if (!p.success) return new Response("Bad request", { status: 400 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("mk_evotor_accounts")
          .upsert({ evotor_user_id: p.data.evotorUserId, redeem_percent: p.data.percent, updated_at: new Date().toISOString() }, { onConflict: "evotor_user_id" });
        if (error) return new Response("Error", { status: 500 });
        return Response.json({ ok: true, percent: p.data.percent });
      },
    },
  },
});
