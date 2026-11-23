import { describe, expect, it } from "vitest";
import { pickInstall } from "./onboarding";
const now = new Date("2026-11-23T14:00:00Z");
describe("привязка установки Эвотора", () => {
  it("берёт непривязанную установку за последние 15 минут", () => {
    const r = pickInstall([{ evotor_user_id: "a", installed: true, installed_at: "2026-11-23T13:50:00Z", phone: null }], "79030000000", now);
    expect(r?.evotor_user_id).toBe("a");
  });
  it("не берёт установку старше 15 минут", () => {
    expect(pickInstall([{ evotor_user_id: "a", installed: true, installed_at: "2026-11-23T13:40:00Z", phone: null }], "79030000000", now)).toBeNull();
  });
  it("не берёт установку, привязанную к другому телефону", () => {
    expect(pickInstall([{ evotor_user_id: "a", installed: true, installed_at: "2026-11-23T13:59:00Z", phone: "79990000000" }], "79030000000", now)).toBeNull();
  });
});
