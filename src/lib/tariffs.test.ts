import { describe, expect, it } from "vitest";

import {
  AI_UNIT_SIZE,
  AMORTIZATION_FUND,
  CASHIER_FREE_NOTE,
  FIRST_MONTH_NOTE,
  FREE_TEST_NOTE,
  SERVICE_TARIFFS,
  TOPUP_PACKAGES,
  unitsLabel,
} from "./tariffs";

// Числа взяты из зафиксированной гипотезы биллинга: меняем только вместе с решением.
describe("Тарифы и учёт AI-юнитов", () => {
  it("держит утверждённые цены трёх тарифов", () => {
    expect(SERVICE_TARIFFS.map((t) => `${t.name} ${t.price}`)).toEqual([
      "Просто 1 950",
      "Учёт 3 850",
      "Контроль 5 650",
    ]);
  });

  it("выдаёт пакеты юнитов 300, 1 000 и 2 500 в месяц", () => {
    expect(SERVICE_TARIFFS.map((t) => t.units)).toEqual([300, 1000, 2500]);
  });

  it("переносит в карточку фонд 750 рублей и бесплатные вопросы кассира", () => {
    expect(AMORTIZATION_FUND).toContain("750");
    expect(CASHIER_FREE_NOTE).toContain("кассир");
  });

  it("обещает первый месяц бесплатно", () => {
    expect(FIRST_MONTH_NOTE).toContain("Первый месяц бесплатно");
    expect(FREE_TEST_NOTE).toContain("бесплатно один месяц");
  });

  it("держит пакеты докупки 500/500, 1 500/1 350 и 5 000/4 000", () => {
    expect(TOPUP_PACKAGES).toEqual([
      { units: 500, price: "500" },
      { units: 1500, price: "1 350" },
      { units: 5000, price: "4 000" },
    ]);
  });

  it("считает юнит как 1 000 токенов и печатает число без разрыва", () => {
    expect(AI_UNIT_SIZE).toBe(1000);
    expect(unitsLabel(2500)).toBe("2\u00A0500");
    expect(unitsLabel(300)).toBe("300");
  });
});

import { TARIFF_STAFF as STAFF, SERVICE_TARIFFS as T2 } from "./tariffs";
import { isValidPhone } from "./onboarding";
describe("лимиты сотрудников", () => {
  it("Просто — 3, Учёт — 5, Контроль — 5", () => {
    expect(STAFF).toEqual({ cyan: 3, lime: 5, amber: 5 });
    expect(T2.map((t) => t.items[0])).toEqual(["3 сотрудника", "5 сотрудников", "5 сотрудников"]);
  });
  it("телефон директора проверяется", () => {
    expect(isValidPhone("+7 900 123-45-67")).toBe(true);
    expect(isValidPhone("12345")).toBe(false);
  });
});

describe("лояльность в тарифах", () => {
  it("во всех трёх тарифах одинаковая «Система лояльности МК Бонус»", () => {
    for (const t of T2) expect(t.items).toContain("Система лояльности МК Бонус");
  });
});
