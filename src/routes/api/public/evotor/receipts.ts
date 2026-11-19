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
        let body: unknown;
        try { body = await request.json(); } catch { return new Response("Bad JSON", { status: 400 }); }
        const list = Array.isArray(body) ? body : [body];
        let moves = 0;
        for (const raw of list.slice(0, 500)) {
          const p = ReceiptSchema.safeParse(raw);
          if (!p.success) continue;
          const m = bonusMove(p.data);
          if (m) { moves++; console.log("mk-bonus move", p.data.id, m.points); }
        }
        // Эвотору важен ответ 200, иначе он будет повторять отправку.
        return Response.json({ ok: true, received: list.length, moves });
      },
    },
  },
});
