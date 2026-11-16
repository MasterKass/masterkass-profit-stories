import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, ImagePlus, Sparkles, X } from "lucide-react";
import { analyzeRefusal } from "@/lib/receipt-ai.functions";
import { MAX_IMAGE_BYTES, type Diagnosis } from "@/lib/receipt-ai";

const QUICK = ["Адрес установки не найден в ФИАС", "Неверный фискальный признак (ФПД)", "Чек в карантине: тег 2106 маркировка", "Ошибка 3924 нет связи с ОФД"];
const SEV = { low: ["ok", "Не срочно"], medium: ["warn", "Решить сегодня"], high: ["bad", "Срочно"] } as const;

export function RefusalAiPanel({ context }: { context: string }) {
  const analyze = useServerFn(analyzeRefusal);
  const [code, setCode] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<Diagnosis | null>(null);

  function onFile(f: File | undefined) {
    if (!f) return;
    setErr("");
    if (f.type.startsWith("image/")) {
      if (f.size > MAX_IMAGE_BYTES) return setErr("Снимок больше 4 МБ.");
      const r = new FileReader();
      r.onload = () => { setImage(String(r.result)); setFileName(f.name); };
      r.readAsDataURL(f);
    } else if (f.type.startsWith("text/") || /\.(txt|json|xml|csv)$/i.test(f.name)) {
      f.text().then((t) => { setText(t.slice(0, 6000)); setFileName(f.name); });
    } else setErr("Загрузите снимок (PNG, JPG) или текстовый файл квитанции.");
  }

  async function run() {
    setBusy(true); setErr(""); setRes(null);
    try {
      const r = await analyze({ data: { code, text, context, ...(image ? { image } : {}) } });
      if (r.ok) setRes(r.diagnosis); else setErr(r.error);
    } catch { setErr("Помощник сейчас недоступен. Попробуйте позже."); }
    finally { setBusy(false); }
  }

  return (
    <section className="mk-card mk-acc-block" aria-label="Разбор отказов и квитанций">
      <p className="mk-cab-kicker"><Sparkles size={14} aria-hidden="true" />Разбор отказов и квитанций</p>
      <p className="mk-cab-muted">Введите код отказа или загрузите квитанцию — помощник объяснит причину и даст план действий.</p>
      <div className="flex flex-wrap gap-2">
        {QUICK.map((q) => <button key={q} type="button" className="mk-eng-chip rounded-full border px-3 py-1 text-xs" onClick={() => setCode(q)}>{q}</button>)}
      </div>
      <div className="mk-eng-form">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Код или формулировка отказа" aria-label="Код отказа" />
      </div>
      <textarea className="w-full rounded-xl border bg-transparent p-3 text-sm" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Текст квитанции (необязательно)" aria-label="Текст квитанции" />
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <ImagePlus size={16} aria-hidden="true" />Загрузить квитанцию
          <input type="file" accept="image/png,image/jpeg,image/webp,.txt,.json,.xml,.csv" className="sr-only" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        {fileName && <span className="mk-cab-muted inline-flex items-center gap-1">{fileName}<button type="button" aria-label="Убрать файл" onClick={() => { setImage(undefined); setFileName(""); }}><X size={14} /></button></span>}
      </div>
      <button type="button" className="mk-eng-diag-btn" disabled={busy} onClick={run}>
        <Sparkles size={16} aria-hidden="true" className={busy ? "animate-pulse" : ""} />{busy ? "Разбираю…" : "Объяснить и предложить решение"}
      </button>
      {err && <p className="mk-eng-diag-none">{err}</p>}
      {res && (
        <div className="space-y-3">
          <div className="mk-eng-grid">
            <div className="mk-eng-tile" data-tone={SEV[res.severity][0]}><small>Срочность</small><b>{SEV[res.severity][1]}</b><span>источник: {res.source}</span></div>
            <div className="mk-eng-tile" data-tone={res.needVisit || res.needSignature ? "warn" : "ok"}><small>Что понадобится</small><b>{res.needVisit ? "Выезд" : "Удалённо"}</b><span>{res.needSignature ? "нужна электронная подпись клиента" : "подпись не нужна"}</span></div>
          </div>
          <p className="mk-cab-org">{res.title}</p>
          <p>{res.cause}</p>
          <ol className="list-decimal space-y-1 pl-5">{res.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          {res.clientMessage && <Copyable label="Сообщение клиенту" value={res.clientMessage} />}
          {res.taskTitle && <Copyable label="Задача в Битрикс24" value={res.taskTitle} />}
          <p className="mk-cab-muted" style={{ fontSize: 12 }}>Ответ сформирован AI — сверяйте с данными кабинета налоговой перед действиями.</p>
        </div>
      )}
    </section>
  );
}

function Copyable({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="flex-1"><small className="mk-cab-muted block">{label}</small>{value}</span>
      <button type="button" aria-label={`Скопировать: ${label}`} onClick={() => navigator.clipboard?.writeText(value)}><Copy size={15} /></button>
    </div>
  );
}
