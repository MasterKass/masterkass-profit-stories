import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Keyboard, Mic, Paperclip, Plus, Send, X } from "lucide-react";
import { BackHome } from "@/components/back-home";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Поддержка · Мастер Касс" },
      { name: "description", content: "Опишите, что случилось на кассе: ИИ-помощник Мастер Касс ответит сразу, а по номеру телефона увидит ваше оборудование." },
      { property: "og:title", content: "Поддержка · Мастер Касс" },
      { property: "og:description", content: "ИИ-помощник по кассам 24/7: ответ сразу, точнее с учётом вашего оборудования." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Support,
});

type Msg = { from: "me" | "ai"; text: string };

function Support() {
  const [q, setQ] = useState("");
  const [voice, setVoice] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "ai", text: "Здравствуйте! Опишите, что случилось на кассе, или прикрепите фото экрана с ошибкой." },
  ]);
  const [phone, setPhone] = useState("");
  const [authed, setAuthed] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);
  const wantFocus = useRef(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!voice && wantFocus.current) { wantFocus.current = false; field.current?.focus(); }
  }, [voice]);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [msgs]);

  const send = () => {
    const text = q.trim() || (files[0] ? `Фото: ${files[0].name}` : "");
    if (!text) return;
    const reply = authed
      ? "Вижу вашу кассу и её состояние. В демо-режиме живые ответы пока не подключены, после запуска помощник разберёт ситуацию по вашему оборудованию."
      : "В демо-режиме живые ответы пока не подключены. Укажите номер телефона ниже, чтобы ответ учитывал ваше оборудование.";
    setMsgs((m) => [...m, { from: "me", text }, { from: "ai", text: reply }]);
    setQ("");
    setFiles([]);
  };

  const digits = phone.replace(/\D/g, "");

  return (
    <main className="mk-page mk-cab min-h-screen">
      <BackHome />
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-24">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Обратиться в поддержку</h1>

        <section className="mk-card mk-csh-ai mk-sup-chat" aria-label="Диалог с ИИ-помощником">
          <div className="mk-sup-log" aria-live="polite">
            {msgs.map((m, i) => (
              <p key={i} className={m.from === "me" ? "mk-sup-me" : "mk-sup-ai"}>{m.text}</p>
            ))}
            <div ref={end} />
          </div>

          <form className="mk-csh-box" onSubmit={(e) => { e.preventDefault(); send(); }}>
            {voice ? (
              <div className="mk-csh-voice">
                <span className="mk-wave flex h-5 items-center gap-1" aria-hidden="true">
                  {Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ animationDelay: `${i * 70}ms` }} />)}
                </span>
                <span>Голосовой режим скоро заработает</span>
              </div>
            ) : (
              <textarea ref={field} value={q} onChange={(e) => setQ(e.target.value)} rows={2} placeholder="Опишите, что случилось на кассе" aria-label="Вопрос ИИ-помощнику"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} />
            )}
            {files.length > 0 && (
              <ul className="mk-csh-files">
                {files.map((f, i) => (
                  <li key={f.name + i}><Paperclip size={13} aria-hidden="true" /><span>{f.name}</span>
                    <button type="button" aria-label={`Убрать ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}><X size={13} aria-hidden="true" /></button></li>
                ))}
              </ul>
            )}
            <div className="mk-csh-bar">
              <label className="mk-csh-ibtn" aria-label="Прикрепить фото или файл">
                <Plus size={22} aria-hidden="true" />
                <input type="file" multiple accept="image/*,.pdf,.txt" className="sr-only" onChange={(e) => { setFiles([...files, ...Array.from(e.target.files ?? [])]); e.target.value = ""; }} />
              </label>
              <span className="flex-1" />
              <button type="button" onClick={() => { wantFocus.current = true; setVoice(false); }} aria-label="Ввести текстом" className={`mk-csh-ibtn ${voice ? "opacity-50" : ""}`}><Keyboard size={20} aria-hidden="true" /></button>
              <button type="button" onClick={() => setVoice(true)} aria-label="Спросить голосом" className={`mk-csh-ibtn ${voice ? "" : "opacity-60"}`}><Mic size={22} aria-hidden="true" /></button>
              {(q.trim().length > 0 || files.length > 0) && (
                <button type="submit" className="mk-csh-ibtn mk-csh-send" aria-label="Отправить"><Send size={18} aria-hidden="true" /></button>
              )}
            </div>
          </form>
        </section>

        <section className="mk-card mk-sup-auth" aria-label="Авторизация по номеру телефона">
          {authed ? (
            <p className="mk-csh-sent"><Check size={16} aria-hidden="true" />Номер подтверждён. Помощник видит ваше оборудование.</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (digits.length >= 11) setAuthed(true); }}>
              <label htmlFor="sup-phone" className="font-semibold">Введите номер телефона для авторизации</label>
              <p className="mk-cab-muted mt-1">Это поможет нам увидеть ваше оборудование, его состояние и сделать ответ более точным.</p>
              <div className="mk-sup-row">
                <input id="sup-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 900 000-00-00" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <button type="submit" disabled={digits.length < 11}>Войти</button>
              </div>
            </form>
          )}
        </section>

        <p className="mk-cab-muted mt-6">Демо-режим: ответы помощника примерные.</p>
      </div>
    </main>
  );
}
