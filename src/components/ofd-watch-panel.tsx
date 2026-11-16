import { Send, CalendarClock } from "lucide-react";
import { unsentState, ofdSubState, OFD_PACKS } from "@/lib/ofd-watch";

const TONE = { ok: "Норма", warn: "Внимание", bad: "Срочно" };

export function OfdWatchPanel({ unsent, oldest, until, now }: { unsent: number; oldest: Date | null; until: Date; now: Date }) {
  const u = unsentState(unsent, oldest, now);
  const s = ofdSubState(until, now);
  return (
    <section className="mk-card mk-acc-block" aria-label="Связь с ОФД">
      <p className="mk-cab-kicker"><Send size={14} aria-hidden="true" />Неотправленные чеки · {TONE[u.tone]}</p>
      {unsent ? (
        <p className="mk-cab-muted">{unsent} чек(ов) не дошли до ОФД, самый старый {u.daysSilent} дн. назад. До блокировки накопителя: <b>{u.daysToBlock} дн.</b></p>
      ) : <p className="mk-cab-muted">Все чеки переданы в ОФД.</p>}
      <p className="mk-cab-kicker" style={{ marginTop: 16 }}><CalendarClock size={14} aria-hidden="true" />Подписка ОФД · {TONE[s.tone]}</p>
      <p className="mk-cab-muted">{s.daysLeft > 0 ? `Осталось ${s.daysLeft} дн.` : "Подписка истекла"}</p>
      {s.offerRenewal && (
        <ul className="mk-acc-list">
          {OFD_PACKS.map((p) => (
            <li key={p.months}><span className="mk-acc-name">Продлить на {p.months} мес.</span><b className="mk-acc-date">{p.price.toLocaleString("ru-RU")} ₽</b></li>
          ))}
        </ul>
      )}
    </section>
  );
}
