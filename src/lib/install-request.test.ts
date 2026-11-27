import { describe, expect, it } from "vitest";
import { validateInstallRequest } from "./install-request";

describe("заявка на установку кассы", () => {
  it("принимает имя и российский телефон, нормализуя номер", () => {
    const r = validateInstallRequest({ name: "Иван", phone: "8 (906) 452-52-00" });
    expect(r.ok && r.value.phone).toBe("+79064525200");
  });
  it("отклоняет пустое имя и неверный телефон", () => {
    const r = validateInstallRequest({ name: " ", phone: "123" });
    expect(r.ok).toBe(false);
    if (!r.ok) { expect(r.errors.name).toBeTruthy(); expect(r.errors.phone).toBeTruthy(); }
  });
});
