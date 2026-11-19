import { createFileRoute } from "@tanstack/react-router";

// evotorUserId — чей процент списания применять.
// Баланс гостя для кассы: ?card=... или ?phone=..., необязательно &amount=сумма чека → сколько можно списать.
export const Route = createFileRoute("/api/public/mk-bonus/balance")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { checkToken, guestKeyFrom, redeemLimit, accountPercent } = await import("@/lib/mk-bonus");
        if (!checkToken(request)) return new Response("Unauthorized", { status: 401 });
        const u = new URL(request.url);
        const key = guestKeyFrom(u.searchParams.get("card"), u.searchParams.get("phone"));
        if (!key) return new Response("Bad request", { status: 400 });
        const amount = Number(u.searchParams.get("amount") ?? 0) || 0;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.from("mk_guests").select("name, balance").eq("guest_key", key).maybeSingle();
        if (error) return new Response("Error", { status: 500 });
        const balance = data?.balance ?? 0;
        const percent = await accountPercent(u.searchParams.get("evotorUserId"));
        return Response.json({ found: !!data, name: data?.name ?? null, balance, maxRedeem: redeemLimit(balance, amount, percent), percent });
      },
    },
  },
});
