/** Вход по номеру телефона и SMS-коду. Пока работает демонстрационный режим без настоящего SMS-шлюза. */

export type Role = "director" | "administrator" | "accountant" | "cashier" | "owner";

export const ROLE_LABELS: Record<Role, string> = {
  director: "Директор",
  administrator: "Администратор",
  accountant: "Бухгалтер",
  cashier: "Кассир",
  owner: "Хозяин",
};

export const ROLE_ACCESS: Record<Role, string[]> = {
  director: ["Выручка", "Сроки оплат", "Лояльность", "Фонд «Новая касса»", "Утренний PDF-дайджест"],
  administrator: ["Товароучёт и накладные", "Контроль смен и расписания", "Инвентаризация и техкарты", "Регламенты точки"],
  accountant: ["График оплат", "Сроки ФН и подписей", "Документы от Мастер Касс", "Сверка смен", "ИИ-помощник по 54-ФЗ"],
  cashier: ["ИИ-наставник", "Вызов инженера", "Обучение"],
  owner: ["Финансы компании", "Клиенты", "Команда", "База знаний", "Стратегический ИИ"],
};

/** Демонстрационные номера: каждый открывает свою роль. Показываются на экране входа. */
export const DEMO_ACCOUNTS: { phone: string; role: Role }[] = [
  { phone: "+79000000001", role: "director" },
  { phone: "+79000000002", role: "administrator" },
  { phone: "+79000000003", role: "accountant" },
  { phone: "+79000000004", role: "cashier" },
];

/** Скрытый доступ владельца: ровно эти два номера. Нигде на экране не показываются. */
export const OWNER_PHONES: string[] = ["+79000000007", "+79000000008"];

export const DEMO_CODE = "1234";
export const CODE_LENGTH = 4;
export const RESEND_SECONDS = 60;

/** Приводит номер к виду +7XXXXXXXXXX или возвращает null. */
export function normalizePhone(input: string): string | null {
  const d = input.replace(/\D/g, "");
  if (d.length === 11 && /^[78]/.test(d)) return `+7${d.slice(1)}`;
  if (d.length === 10) return `+7${d}`;
  return null;
}

/** Маска ввода: +7 900 000-00-01. */
export function formatPhone(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.length > 10 && /^[78]/.test(d)) d = d.slice(1);
  d = d.slice(0, 10);
  let out = "+7";
  if (d.length) out += " " + d.slice(0, 3);
  if (d.length > 3) out += " " + d.slice(3, 6);
  if (d.length > 6) out += "-" + d.slice(6, 8);
  if (d.length > 8) out += "-" + d.slice(8, 10);
  return out;
}

export function roleForPhone(phone: string): Role | null {
  if (OWNER_PHONES.includes(phone)) return "owner";
  return DEMO_ACCOUNTS.find((a) => a.phone === phone)?.role ?? null;
}

export type VerifyResult = { ok: true; role: Role } | { ok: false; error: string };

export function verifyCode(phone: string, code: string): VerifyResult {
  const role = roleForPhone(phone);
  if (!role) return { ok: false, error: "Этот номер пока не подключён к сервису" };
  if (code !== DEMO_CODE) return { ok: false, error: "Код не подошёл. Проверьте цифры из SMS" };
  return { ok: true, role };
}
