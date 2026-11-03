import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowUp, Crown, FileText, Plus, Sparkles } from "lucide-react";
import { BackHome } from "@/components/back-home";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "Пространство «Хозяин» · Мастер Касс" },
      { name: "description", content: "Закрытое рабочее пространство компании Мастер Касс: файлы по разделам и стратегический ИИ-помощник." },
      { property: "og:title", content: "Пространство «Хозяин» · Мастер Касс" },
      { property: "og:description", content: "Маркетинг, финансы, интеграции и сотрудники в одном месте вместе с ИИ-помощником." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OwnerPage,
});

type Doc = { name: string; date: string; note: string };

const SECTIONS: Record<string, Doc[]> = {
  Маркетинг: [
    { name: "Кейс кофейни.pdf", date: "28 окт", note: "История владельца: от одной точки до шести" },
    { name: "План рилсов на ноябрь.docx", date: "30 окт", note: "Зоопарк программ, будни кассира" },
  ],
  Финансы: [
    { name: "Тарифы и юниты.xlsx", date: "25 окт", note: "1 950 / 3 850 / 5 650 ₽, себестоимость AI" },
    { name: "Фонд «Новая касса».pdf", date: "20 окт", note: "Модель накопления 750 ₽ в месяц" },
  ],
  Интеграции: [
    { name: "Битрикс24: приём заявок.docx", date: "1 ноя", note: "Схема от Дениса" },
    { name: "Эвотор: приложение.pdf", date: "2 ноя", note: "Черновик требований" },
  ],
  Сотрудники: [
    { name: "Регламент инженера.docx", date: "15 окт", note: "Выезд, диагностика, отчёт" },
  ],
};

const CHIPS = ["План постов на неделю", "Фонд при 100 кассах", "Регламент для инженера"];

function OwnerPage() {
  const [docs, setDocs] = useState(SECTIONS);
  const [tab, setTab] = useState("Маркетинг");
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<{ q: string; src: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const ask = (text: string) => {
    if (!text.trim()) return;
    setAnswer({ q: text, src: (docs[tab] ?? [])[0]?.name ?? "файлы раздела" });
    setQ("");
  };

  return (
    <div className="mk-page min-h-screen">
      <BackHome />
      <main className="mk-own">
        <span className="mk-own-badge"><Crown aria-hidden="true" />Хозяин</span>
        <h1 className="mk-own-title">Пространство Мастер Касс</h1>
        <p className="mk-own-note">Наши файлы и наработки. ИИ-помощник отвечает на их основе.</p>

        <nav className="mk-own-tabs" aria-label="Разделы">
          {Object.keys(docs).map((s) => (
            <button key={s} type="button" aria-pressed={tab === s} onClick={() => setTab(s)}>
              {s} <span>{(docs[s] ?? []).length}</span>
            </button>
          ))}
        </nav>

        <section className="mk-card mk-own-files" aria-label={`Файлы: ${tab}`}>
          {(docs[tab] ?? []).map((d) => (
            <div key={d.name} className="mk-own-file">
              <FileText aria-hidden="true" />
              <div><b>{d.name}</b><span>{d.note}</span></div>
              <time>{d.date}</time>
            </div>
          ))}
          <button type="button" className="mk-own-upload" onClick={() => fileRef.current?.click()}>
            <Plus aria-hidden="true" />Загрузить файл (PDF, DOCX, таблицы)
          </button>
          <input
            ref={fileRef}
            type="file"
            hidden
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setDocs((p) => ({ ...p, [tab]: [{ name: f.name, date: "сегодня", note: "Загружено вами" }, ...(p[tab] ?? [])] }));
              e.target.value = "";
            }}
          />
        </section>

        <section className="mk-card mk-own-ai" aria-label="Стратегический ИИ-помощник">
          <h2><Sparkles aria-hidden="true" />Стратегический ИИ-помощник</h2>
          {answer && (
            <div className="mk-own-answer">
              <p><b>Вы:</b> {answer.q}</p>
              <p>Демо-ответ. Когда подключим ИИ, здесь будет ответ по вашим документам.</p>
              <small>Основано на файле: {answer.src}</small>
            </div>
          )}
          <form className="mk-own-ask" onSubmit={(e) => { e.preventDefault(); ask(q); }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Вопрос по разделу «${tab}»`} aria-label="Вопрос ИИ-помощнику" />
            <button type="submit" aria-label="Отправить"><ArrowUp /></button>
          </form>
          <div className="mk-own-chips">
            {CHIPS.map((c) => <button key={c} type="button" onClick={() => ask(c)}>{c}</button>)}
          </div>
        </section>
      </main>
    </div>
  );
}
