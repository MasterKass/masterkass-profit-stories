import { createFileRoute } from "@tanstack/react-router";

// «События установки/удаления приложения» и «Токен приложения» от Эвотора.
// Формат события: { type: "ApplicationInstalled" | "ApplicationUninstalled", data: { userId } };
// токен пользователя: { userId, token } — хранится только на сервере.
export const Route = createFileRoute("/api/public/evotor/events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { checkToken } = await import("@/lib/mk-bonus");
        if (!checkToken(request)) return new Response("Unauthorized", { status: 401 });
        let b: any; try { b = await request.json(); } catch { return new Response("Bad JSON", { status: 400 }); }
        const userId = String(b?.data?.userId ?? b?.userId ?? "").slice(0, 100);
        if (!userId) return new Response("Bad request", { status: 400 });
        const now = new Date().toISOString();
        const row: Record<string, unknown> = { evotor_user_id: userId, updated_at: now };
        if (typeof b?.token === "string") row.api_token = b.token.slice(0, 500);
        if (b?.type === "ApplicationInstalled") Object.assign(row, { installed: true, installed_at: now, removed_at: null });
        if (b?.type === "ApplicationUninstalled") Object.assign(row, { installed: false, removed_at: now, api_token: null });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("mk_evotor_accounts").upsert(row as never, { onConflict: "evotor_user_id" });
        if (error) return new Response("Error", { status: 500 });
        return Response.json({ ok: true });
      },
    },
  },
});
