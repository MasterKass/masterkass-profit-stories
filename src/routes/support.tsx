import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bot, Phone, Wrench } from "lucide-react";
import { SiteFooter } from "@/components/home-sections";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Поддержка · Мастер Касс" },
      { name: "description", content: "Обратитесь в поддержку Мастер Касс: AI-наставник круглосуточно и инженеры сервиса." },
      { property: "og:title", content: "Поддержка Мастер Касс" },
      { property: "og:description", content: "AI-наставник 24/7 и инженеры кассового сервиса." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Support,
});

const ways = [
  { icon: Bot, title: "AI-наставник", text: "Быстрые ответы, диагностика и инструкции голосом в реальном времени." },
  { icon: Wrench, title: "Сбой на кассе", text: "Разберём ошибку и при необходимости подключим инженера." },
  { icon: Phone, title: "Связаться с менеджером", text: "Вопросы по сервису, тарифам и подключению." },
];

function Support() {
  return (
    <div className="mk-page min-h-screen">
      <main className="mx-auto max-w-3xl px-5 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />На главную
        </Link>
        <h1 className="mt-8 text-4xl font-bold tracking-tight">Обратиться в поддержку</h1>
        <p className="mt-4 text-lg text-muted-foreground">Выберите, с чем вам помочь.</p>
        <div className="mt-8 grid gap-4">
          {ways.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border bg-card p-6">
              <Icon className="h-6 w-6" />
              <h2 className="mt-3 text-xl font-semibold">{title}</h2>
              <p className="mt-1 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
