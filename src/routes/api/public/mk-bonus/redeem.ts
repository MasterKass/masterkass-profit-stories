import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Списание баллов кассиром. requestId — уникален для чека: повтор не спишет дважды.
const B = z.object({
  requestId: z.string().trim().min(1).max(100),
  card: z.string().max(64).optional(), phone: z.string().max(32).optional(),
  points: z.number().int().positive().max(1_000_000),
  amount: z.number().positive().max(100_000_000),
  evotorUserId: z.string().max(100).optional(), storeId: z.string().max(100).optional(),
});

export const Route = createFileRoute("/api/public/mk-bonus/redeem")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { checkToken, guestKeyFrom, redeemLimit, accountPercent } = await import("@/lib/mk-bonus");
        if (!checkToken(request)) return new Response("Unauthorized", { status: 401 });
        let raw: unknown; try { raw = await request.json(); } catch { return new Response("Bad JSON", { status: 400 }); }
        const p = B.safeParse(raw);
        if (!p.success) return new Response("Bad request", { status: 400 });
        const key = guestKeyFrom(p.data.card, p.data.phone);
        if (!key) return new Response("Bad request", { status: 400 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: g } = await supabaseAdmin.from("mk_guests").select("balance").eq("guest_key", key).maybeSingle();
        if (!g) return Response.json({ ok: false, reason: "not_found" }, { status: 404 });
        const { data: done } = await supabaseAdmin.from("mk_bonus_ops").select("points").eq("receipt_id", `redeem:${p.data.requestId}`).maybeSingle();
        if (done) return Response.json({ ok: true, discount: -done.points, balance: g.balance, repeat: true });
        const max = redeemLimit(g.balance, p.data.amount, await accountPercent(p.data.evotorUserId));
        if (p.data.points > max) return Response.json({ ok: false, reason: "over_limit", maxRedeem: max }, { status: 409 });
        const { data, error } = await supabaseAdmin.rpc("mk_redeem_bonus", {
          p_request_id: `redeem:${p.data.requestId}`, p_guest_key: key, p_points: p.data.points, p_amount: p.data.amount,
          p_evotor_user_id: (p.data.evotorUserId ?? null) as unknown as string, p_store_id: (p.data.storeId ?? null) as unknown as string,
        });
        if (error) return Response.json({ ok: false, reason: "rejected" }, { status: 409 });
        return Response.json({ ok: true, discount: p.data.points, balance: data });
      },
    },
  },
});
