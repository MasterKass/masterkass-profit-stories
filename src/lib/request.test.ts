import { describe, it, expect } from "vitest";
import { validateRequest } from "./request";

describe("проверка заявки на сервис", () => {
  it("принимает телефон и почту, приводит их к одному виду", () => {
    const r = validateRequest({ phone: "+7 (904) 123-45-67", email: "  Kassa@Shop.ru " });
    expect(r.ok && r.value).toEqual({ phone: "+79041234567", email: "kassa@shop.ru" });
  });

  it("принимает номер через 8 без плюса", () => {
    const r = validateRequest({ phone: "89041234567", email: "a@b.ru" });
    expect(r.ok && r.value.phone).toBe("+79041234567");
  });

  it("не принимает короткий номер", () => {
    const r = validateRequest({ phone: "123-45", email: "a@b.ru" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.phone).toContain("10 цифр");
  });

  it("не принимает телефон с буквами", () => {
    const r = validateRequest({ phone: "+7 904 купить кассу", email: "a@b.ru" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.phone).toContain("цифрами");
  });

  it("не принимает номер другого города без кода", () => {
    const r = validateRequest({ phone: "+375 29 1234567", email: "a@b.ru" });
    expect(r.ok).toBe(false);
  });

  it("не принимает почту без собаки", () => {
    const r = validateRequest({ phone: "+79041234567", email: "kassa-shop" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.email).toContain("почт");
  });

  it("просит заполнить поле телефона, если оно пустое", () => {
    const r = validateRequest({ phone: "   ", email: "a@b.ru" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.phone).toContain("Нужен телефон");
  });

  it("не принимает пустые поля", () => {
    const r = validateRequest({ phone: "", email: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["email", "phone"]);
  });
});
