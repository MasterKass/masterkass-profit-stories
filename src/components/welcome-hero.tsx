import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import cafe from "@/assets/team-cafe.jpg";
import florist from "@/assets/team-florist.jpg";
import bakery from "@/assets/team-bakery.jpg";
import boutique from "@/assets/team-boutique.jpg";
import salon from "@/assets/team-salon.jpg";

export function WelcomeHero() {
  const scene = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = scene.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = Math.min(1, Math.max(0, -element.getBoundingClientRect().top / element.offsetHeight));
      element.style.setProperty("--scene-progress", String(progress));
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const continueTo = (id: string) => document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });

  return (
    <section ref={scene} className="welcome-hero" aria-labelledby="welcome-title">
      <div className="welcome-copy">
        <span className="welcome-badge"><span className="welcome-badge-dot" aria-hidden="true" />Официальный партнёр Эвотор</span>
        <h1 id="welcome-title">Добро пожаловать<br />в <span className="welcome-highlight">кассовый сервис</span></h1>
        <p>Берём на себя всю заботу о технологиях,<br className="hidden sm:block" /> пока вы заботитесь о своих клиентах.</p>
        <Button onClick={() => continueTo("assistant")} className="welcome-contact">
          <MessageCircle />Написать дежурному инженеру<ArrowUpRight />
        </Button>
      </div>
      <div className="team-scene" aria-label="Команды пяти разных бизнесов">
        <div className="team-photo team-photo-left">
          <div className="team-photo-float"><img src={florist} alt="Улыбающаяся команда цветочного салона с букетами" width={1536} height={1024} /></div>
        </div>
        <div className="team-photo team-photo-right">
          <div className="team-photo-float"><img src={bakery} alt="Дружная команда пекарни со свежим хлебом" width={1536} height={1024} /></div>
        </div>
        <div className="team-photo team-photo-center">
          <div className="team-photo-float"><img src={cafe} alt="Команда кофейни: бариста показывает сердечко руками" width={1536} height={1024} fetchPriority="high" /></div>
        </div>
        <div className="team-photo team-photo-bottom-left">
          <div className="team-photo-float"><img src={boutique} alt="Владелицы магазина одежды приветствуют гостей" width={1536} height={1024} loading="lazy" /></div>
        </div>
        <div className="team-photo team-photo-bottom-right">
          <div className="team-photo-float"><img src={salon} alt="Улыбающаяся команда парикмахерской" width={1536} height={1024} loading="lazy" /></div>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="welcome-scroll" aria-label="Листать дальше" onClick={() => continueTo("niches")}><ArrowDown /></Button>
    </section>
  );
}