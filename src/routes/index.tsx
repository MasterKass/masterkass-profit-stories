import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { WelcomeHero } from "@/components/welcome-hero";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { AiReveal, AskAi, Benefit, ClientStories, GeoMap, JoinCta, Partners, QuickActions, ServiceFaq, SiteFooter } from "@/components/home-sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Мастер Касс · кассовый сервис в Ростове-на-Дону и на юге" },
      { name: "description", content: "Заботимся о технологиях, пока вы заботитесь о клиентах. Сопровождение касс и AI-наставник с 9-летним опытом инженеров." },
      { property: "og:title", content: "Мастер Касс · кассовый сервис" },
      { property: "og:description", content: "Сопровождение касс, AI-наставник и 9 лет опыта сервисных инженеров." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  // Главная всегда открывается с первого экрана: браузер не возвращает прошлую позицию скролла.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="mk-page min-h-screen">
      <Header />
      <WelcomeHero />
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
