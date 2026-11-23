import { createServerFn } from "@tanstack/react-start";
import { isValidPhone, normPhone, pickInstall, LINK_WINDOW_MIN } from "./onboarding";

// Вариант А: клиент нажал «Проверить подключение» — привязываем свежую установку Эвотора к его телефону.
export const linkEvotorInstall = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => {
    const x = d as { phone?: unknown; dealId?: unknown } | null;
    const phone = String(x?.phone ?? "");
    if (!isValidPhone(phone)) throw new Error("Неверный телефон");
    return { phone: normPhone(phone), dealId: Number(x?.dealId) || 0 };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - LINK_WINDOW_MIN * 60000).toISOString();
    const { data: rows, error } = await supabaseAdmin
      .from("mk_evotor_accounts")
      .select("evotor_user_id, installed, installed_at, phone")
      .or(`phone.eq.${data.phone},and(phone.is.null,installed_at.gte.${since})`)
      .limit(50);
    if (error) { console.error("link lookup", error); return { ok: false as const, error: "Не удалось проверить, попробуйте ещё раз" }; }
    const hit = pickInstall(rows ?? [], data.phone, new Date());
    if (!hit) return { ok: false as const, error: "Сигнал от Эвотора ещё не пришёл. Подождите минуту и проверьте снова" };
    if (hit.phone !== data.phone) {
      const { error: e } = await supabaseAdmin.from("mk_evotor_accounts")
        .update({ phone: data.phone, deal_id: data.dealId || null, linked_at: new Date().toISOString() })
        .eq("evotor_user_id", hit.evotor_user_id).is("phone", null);
      if (e) { console.error("link update", e); return { ok: false as const, error: "Не удалось сохранить привязку" }; }
    }
    return { ok: true as const };
  });
