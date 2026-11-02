// Мастер подключения тарифа: карта (0 ₽) → касса → почта для дайджеста → готово.
// Пока демо: карта, Эвотор и почта не отправляются на сервер.
import { SERVICE_TARIFFS, type TariffTone } from "@/lib/tariffs";

export const ONBOARDING_STEPS = ["Карта", "Касса", "Почта", "Готово"] as const;
export const REFERRAL_BONUS_UNITS = 300;
export const TRIAL_DAYS = 30;

export function findTariff(tone: string | undefined) {
  return SERVICE_TARIFFS.find((t) => t.tone === tone) ?? SERVICE_TARIFFS[0];
}

/** Дата первого списания: через 30 дней после привязки карты */
export function firstChargeDate(from: Date) {
  const d = new Date(from);
  d.setDate(d.getDate() + TRIAL_DAYS);
  return d;
}

export function startingUnits(tone: TariffTone, hasReferral: boolean) {
  return findTariff(tone).units + (hasReferral ? REFERRAL_BONUS_UNITS : 0);
}

export function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export function isValidCard(number: string, exp: string, cvc: string) {
  const n = number.replace(/\D/g, "");
  return n.length === 16 && /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp) && /^\d{3}$/.test(cvc);
}
