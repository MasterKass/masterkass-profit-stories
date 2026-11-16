// Карантин чеков: чек принят ФН и ОФД, но налоговая вернула замечание.
export type QuarantineReason = "marking" | "regFlags" | "taxSystem" | "buyer" | "time";
export type QuarantineCheck = { doc: string; at: Date; sum: number; reason: QuarantineReason; tag?: string };

export const QUARANTINE_INFO: Record<QuarantineReason, { title: string; fix: string; call: boolean }> = {
  marking: { title: "Маркировка: нет или не прошёл код проверки (теги 1162/2106)", fix: "Проверить прошивку и разрешительный режим, повторить проверку кода, пробить чек коррекции.", call: true },
  regFlags: { title: "Касса не перерегистрирована под вид продаж (подакциз 1207, агент 1057, маркировка)", fix: "Перерегистрировать кассу с нужным признаком через ЛК налоговой с подписью клиента.", call: true },
  taxSystem: { title: "Система налогообложения или НДС не совпадает с регистрацией", fix: "Сверить СНО в карточке регистрации и настройках кассы, при смене — перерегистрация.", call: true },
  buyer: { title: "Ошибочный ИНН или наименование покупателя (теги 1227/1228)", fix: "Уточнить реквизиты покупателя у бухгалтера, пробить чек коррекции.", call: false },
  time: { title: "Время чека расходится со временем приёма больше суток", fix: "Проверить часы и батарейку кассы, выгрузить неотправленные чеки.", call: false },
};

export const QUARANTINE_WINDOW_DAYS = 7;

export function activeQuarantine(list: QuarantineCheck[], now: Date): QuarantineCheck[] {
  const from = now.getTime() - QUARANTINE_WINDOW_DAYS * 86_400_000;
  return list.filter((c) => c.at.getTime() >= from).sort((a, b) => b.at.getTime() - a.at.getTime());
}

export function quarantineSummary(list: QuarantineCheck[], now: Date) {
  const act = activeQuarantine(list, now);
  const reasons = [...new Set(act.map((c) => c.reason))];
  return { count: act.length, reasons, needCall: reasons.some((r) => QUARANTINE_INFO[r].call), checks: act };
}

export function quarantineTaskTitle(serial: string, client: string, reasons: QuarantineReason[]) {
  return `[Карантин чеков] Касса ${serial}, ${client}: ${reasons.map((r) => QUARANTINE_INFO[r].title.split(":")[0]).join(", ")}`;
}
