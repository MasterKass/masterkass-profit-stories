import { describe, expect, it } from "vitest";
import { parseDiagnosis, validateInput } from "./receipt-ai";

describe("разбор отказов", () => {
  it("пустой ввод отклоняется", () => {
    expect(validateInput({ code: " ", text: "" })).not.toBeNull();
  });
  it("только код отказа принимается", () => {
    expect(validateInput({ code: "адрес не найден в ФИАС", text: "" })).toBeNull();
  });
  it("файл не-картинка отклоняется", () => {
    expect(validateInput({ code: "", text: "", image: "data:application/pdf;base64,AAA" })).not.toBeNull();
  });
  it("ответ без шагов считается ошибкой", () => {
    expect(parseDiagnosis(JSON.stringify({ cause: "x", steps: [] }))).toBeNull();
  });
  it("неизвестная критичность становится средней", () => {
    expect(parseDiagnosis(JSON.stringify({ cause: "x", steps: ["a"], severity: "??" }))?.severity).toBe("medium");
  });
});
