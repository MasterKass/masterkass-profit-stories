import { useState } from "react";
import { Wrench, ShieldCheck, Gift, Settings2, Bell, ChevronDown } from "lucide-react";

type Kind = "master" | "shield" | "bonus" | "settings" | "alert";
const ICON = { master: Wrench, shield: ShieldCheck, bonus: Gift, settings: Settings2, alert: Bell };
const LABEL: Record<Kind, string> = { master: "Работа мастера", shield: "Предотвращено", bonus: "МК Бонус", settings: "Изменение", alert: "Оповещение" };

// Демо-лента. Реальные события придут из журнала сервера.
export const HISTORY: { date: string; kind: Kind; text: string }[] = [
  { date: "17 ноября, 18:40", kind: "alert", text: "Касса потеряла интернет — кассиру ушло напоминание, связь восстановилась за 7 минут." },
  { date: "15 ноября, 10:12", kind: "settings", text: "Директор изменил кешбэк МК Бонус с 5% на 7%. Правила ушли на кассу." },
  { date: "14 ноября, 16:05", kind: "master", text: "Мастер Денис обновил прошивку Эвотор и проверил связь с ОФД." },
  { date: "10 ноября, 09:00", kind: "bonus", text: "Запущены приветственные баллы: за выходные выдано 24 новые карты." },
  { date: "8 ноября, 12:30", kind: "shield", text: "Два чека попали в карантин налоговой — мастер исправил маркировку, штрафа нет." },
  { date: "3 ноября, 08:00", kind: "master", text: "Подготовлен утренний дайджест и сверка смены с ОФД." },
  { date: "1 ноября, 11:20", kind: "bonus", text: "Push «спящим» гостям: вернулись 11 покупателей, +9 800 ₽ к выручке." },
  { date: "28 октября, 14:00", kind: "shield", text: "Напоминание о замене фискального накопителя за 30 дней — заявка на замену создана." },
  { date: "21 октября, 10:45", kind: "master", text: "Подключён второй сотрудник, выданы права кассира." },
];

export function CareHistory() {
  const [all, setAll] = useState(false);
  const list = all ? HISTORY : HISTORY.slice(0, 4);
  return (
    <section className="mk-card mk-hist" aria-label="История работы">
      <p className="mk-cab-kicker">История: что сделано для вашей точки</p>
      <p className="mk-cab-muted">За ноябрь — {HISTORY.filter((h) => h.date.includes("ноября")).length} событий</p>
      <ol>
        {list.map((h) => {
          const Icon = ICON[h.kind];
          return (
            <li key={h.date + h.text} data-kind={h.kind}>
              <span className="mk-hist-ico"><Icon size={15} aria-hidden="true" /></span>
              <span><small>{h.date} · {LABEL[h.kind]}</small>{h.text}</span>
            </li>
          );
        })}
      </ol>
      <button type="button" className="mk-cab-fnbtn mk-hist-more" aria-expanded={all} onClick={() => setAll((v) => !v)}>
        {all ? "Свернуть" : `Развернуть всю историю (${HISTORY.length})`}
        <ChevronDown size={14} className="mk-cab-chev" data-open={all} aria-hidden="true" />
      </button>
    </section>
  );
}
