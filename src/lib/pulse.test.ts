import { describe, expect, it } from "vitest";

import { PULSE_EVENTS, PULSE_FOOTER_LINKS, pulseFooterRoute } from "./pulse";

describe("ссылки подвала на разборы «Пульса Гос.регулирования»", () => {
  it("каждое слово подвала ведёт на существующий разбор", () => {
    for (const [label, title] of Object.entries(PULSE_FOOTER_LINKS)) {
      expect(PULSE_EVENTS.some((e) => e.title === title), `нет события для «${label}»`).toBe(true);
    }
  });

  it("якорь ссылки совпадает с индексом карточки на странице", () => {
    for (const [label, title] of Object.entries(PULSE_FOOTER_LINKS)) {
      const index = PULSE_EVENTS.findIndex((e) => e.title === title);
      expect(pulseFooterRoute(label)).toEqual({ to: "/pulse", hash: `ev-${index}` });
    }
  });

  it("у слова без разбора ссылки нет", () => {
    expect(pulseFooterRoute("Онлайн-касса в Ростове-на-Дону")).toBeUndefined();
  });
});
