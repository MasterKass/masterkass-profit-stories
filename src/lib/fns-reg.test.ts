import { describe, expect, it } from "vitest";
import { regState, addressRisk } from "./fns-reg";

const t0 = new Date("2026-11-16T10:00:00Z");
const h = (n: number) => new Date(t0.getTime() + n * 3_600_000);

describe("контроль перерегистрации", () => {
  it("первые 48 часов касса на наблюдении", () => {
    expect(regState(t0, [{ at: h(1), answer: "reregistered" }], h(14))).toEqual({ kind: "watch", hoursPassed: 14, hoursLeft: 34 });
  });
  it("через 48 часов без отказа — подтверждено", () => {
    expect(regState(t0, [], h(48)).kind).toBe("confirmed");
  });
  it("поздний отказ на второй день даёт 30 дней и задачу на 20-й день", () => {
    const s = regState(t0, [{ at: h(1), answer: "reregistered" }, { at: h(30), answer: "refused", reason: "ФИАС" }], h(30));
    expect(s.kind).toBe("refused");
    if (s.kind === "refused") {
      expect(s.daysLeft).toBe(30);
      expect(s.taskDue.getTime() - h(30).getTime()).toBe(20 * 86_400_000);
    }
  });
  it("через 30 дней после отказа касса снята с учёта", () => {
    expect(regState(t0, [{ at: h(1), answer: "refused" }], h(1 + 30 * 24)).kind).toBe("deregistered");
  });
  it("адрес без номера дома в ФИАС — риск отказа", () => {
    expect(addressRisk({ found: true, houseNumber: "" })).toBe("refusal-risk");
    expect(addressRisk({ found: false })).toBe("refusal-risk");
    expect(addressRisk({ found: true, houseNumber: "45" })).toBe("ok");
  });
});
