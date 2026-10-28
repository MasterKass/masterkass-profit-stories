import { createFileRoute } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { WelcomeHero } from "@/components/welcome-hero";
import { Button } from "@/components/ui/button";
import { AiReveal, AskAi, Benefit, ClientStories, GeoMap, JoinCta, Partners, QuickActions, ServiceFaq, SiteFooter } from "@/components/home-sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Мастер Касс — кассовый сервис в Ростове-на-Дону и на юге" },
      { name: "description", content: "Заботимся о технологиях, пока вы заботитесь о клиентах. Сопровождение касс и AI-наставник с 9-летним опытом инженеров." },
      { property: "og:title", content: "Мастер Касс — кассовый сервис" },
      { property: "og:description", content: "Сопровождение касс, AI-наставник и 9 лет опыта сервисных инженеров." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="mk-page min-h-screen">
      <Header />
      <WelcomeHero />
      <div id="niches" />
      <AiReveal />
      <QuickActions />
      <Benefit />
      <JoinCta />
      <GeoMap />
      <ClientStories />
      <div className="mk-tail">
        <Partners />
        <ServiceFaq />
        <AskAi />
        <SiteFooter />
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <svg className="welcome-logo" viewBox="0 0 32 32" width="38" height="38" aria-hidden="true">
      {[
        ["16,3 27.3,9.5", "oklch(0.86 0.17 92)"],
        ["27.3,9.5 27.3,22.5", "oklch(0.85 0.18 120)"],
        ["27.3,22.5 16,29", "oklch(0.83 0.18 145)"],
        ["16,29 4.7,22.5", "oklch(0.8 0.13 210)"],
        ["4.7,22.5 4.7,9.5", "oklch(0.74 0.17 50)"],
        ["4.7,9.5 16,3", "oklch(0.8 0.17 72)"],
      ].map(([pts, color]) => (
        <polygon key={pts} points={`16,16 ${pts}`} fill={color} fillOpacity="0.9" />
      ))}
      <path d="M16 3 L27.3 9.5 L27.3 22.5 L16 29 L4.7 22.5 L4.7 9.5 Z M16 3 L16 29 M4.7 9.5 L27.3 22.5 M27.3 9.5 L4.7 22.5" fill="none" stroke="oklch(1 0 0 / 0.8)" strokeWidth="0.7" strokeLinejoin="round" />
    </svg>
  );
}

function Header() {
  return (
    <header className="welcome-header sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-8">
        <span className="welcome-brand flex items-center gap-1"><BrandMark />Мастер Касс</span>
        <Button type="button" variant="outline" title="Раздел в разработке" className="welcome-login"><LogIn />Войти</Button>
      </div>
    </header>
  );
}
