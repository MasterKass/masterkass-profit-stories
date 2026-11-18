import { describe, expect, it } from "vitest";
import {
  CODE_LENGTH,
  DEMO_ACCOUNTS,
  DEMO_CODE,
  OWNER_PHONES,
  DEMO_OWNER_PHONE,
  RESEND_SECONDS,
  formatPhone,
  normalizePhone,
  roleForPhone,
  verifyCode,
} from "./login";

describe("вход по SMS", () => {
  it("принимает номер с 8, +7 и без кода страны", () => {
    expect(normalizePhone("8 900 000-00-01")).toBe("+79000000001");
    expect(normalizePhone("+7 (900) 000-00-01")).toBe("+79000000001");
    expect(normalizePhone("9000000001")).toBe("+79000000001");
    expect(normalizePhone("90000")).toBeNull();
  });
  it("форматирует номер маской", () => {
    expect(formatPhone("89000000001")).toBe("+7 900 000-00-01");
  });
  it("код из 4 цифр, повтор через 60 секунд", () => {
    expect(CODE_LENGTH).toBe(4);
    expect(RESEND_SECONDS).toBe(60);
  });
  it("каждый демо-номер открывает свою роль", () => {
    expect(verifyCode("+79000000001", "1234")).toEqual({ ok: true, role: "director" });
    expect(verifyCode("+79000000002", "1234")).toEqual({ ok: true, role: "administrator" });
    expect(verifyCode("+79000000003", "1234")).toEqual({ ok: true, role: "accountant" });
    expect(verifyCode("+79000000004", "1234")).toEqual({ ok: true, role: "cashier" });
  });
  it("на экране входа показаны роли: директор, администратор, бухгалтер, кассир, партнёр, мастер", () => {
    expect(DEMO_ACCOUNTS.map((a) => a.role)).toEqual(["director", "administrator", "accountant", "cashier", "partner", "engineer"]);
    expect(DEMO_ACCOUNTS.some((a) => a.role === "owner")).toBe(false);
  });
  it("хозяин скрыт: открывается ровно двумя номерами", () => {
    expect(OWNER_PHONES).toHaveLength(2);
    expect(roleForPhone("+79000000007")).toBe("owner");
    expect(roleForPhone("+79034021777")).toBe("owner");
    expect(roleForPhone("+79064525200")).toBe("owner");
    expect(DEMO_OWNER_PHONE).toBe("+79000000007");
    expect(verifyCode("+79000000007", "1234")).toEqual({ ok: true, role: "owner" });
    expect(DEMO_ACCOUNTS.some((a) => OWNER_PHONES.includes(a.phone))).toBe(false);
  });
  it("неверный код и чужой номер не пускают", () => {
    expect(verifyCode("+79000000001", "0000").ok).toBe(false);
    expect(verifyCode("+79991112233", "1234").ok).toBe(false);
    expect(roleForPhone("+79991112233")).toBeNull();
  });
});

describe("partner login", () => {
  it("opens the partner role for the partner demo phone", () => {
    expect(verifyCode("+79000000005", "1234")).toEqual({ ok: true, role: "partner" });
  });
});

describe("engineer login", () => {
  it("opens the master role for the engineer demo phone", () => {
    expect(verifyCode("+79000000006", "1234")).toEqual({ ok: true, role: "engineer" });
    expect(roleForPhone("+79000000006")).toBe("engineer");
  });
});
