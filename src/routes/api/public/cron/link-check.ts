import { createFileRoute } from "@tanstack/react-router";

// Регулярная проверка связи касс. Вызывается планировщиком, например раз в час:
// POST /api/public/cron/link-check с заголовком Authorization: Bearer <CRON_SECRET>.
// Задачи в Битрикс24 не дублируются: перед созданием ищем задачу за последние сутки.
export const Route = createFileRoute("/api/public/cron/link-check")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CRON_SECRET"];
        const auth = request.headers.get("authorization") ?? "";
        if (!secret || auth !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
        const { runLinkSilenceCheck } = await import("@/lib/evotor.server");
        const r = await runLinkSilenceCheck(false);
        // Наружу только статус, без данных клиента.
        return Response.json(r.ok ? { ok: true, task: r.id } : { ok: false, reason: r.reason }, { status: r.ok || r.reason !== "bitrix_error" ? 200 : 502 });
      },
    },
  },
});
