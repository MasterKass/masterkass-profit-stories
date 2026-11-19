import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Баланс гостя для кассы: ?card=... или ?phone=..., тот же токен, что у приёма чеков.
const Q = z.object({ card: z.string().trim().min(1).max(64).optional(), phone: z.string().max(32).optional() });

export const Route = createFileRoute("/api/public/mk-bonus/balance")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env["EVOTOR_WEBHOOK_TOKEN"];
        const auth = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
        if (!secret || auth !== secret) return new Response("Unauthorized", { status: 401 });
        const u = new URL(request.url);
        const q = Q.safeParse({ card: u.searchParams.get("card") ?? undefined, phone: u.searchParams.get("phone") ?? undefined });
        if (!q.success) return new Response("Bad request", { status: 400 });
        let key: string | null = null;
        if (q.data.card) key = `card:${q.data.card}`;
        else if (q.data.phone) { const dg = q.data.phone.replace(/\D/g, ""); if (dg.length >= 10) key = `phone:7${dg.slice(-10)}`; }
        if (!key) return new Response("Bad request", { status: 400 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.from("mk_guests").select("balance").eq("guest_key", key).maybeSingle();
        if (error) return new Response("Error", { status: 500 });
        return Response.json({ found: !!data, balance: data?.balance ?? 0 });
      },
    },
  },
});
