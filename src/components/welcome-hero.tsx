import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import face from "@/assets/service-face.jpg";
import seminar from "@/assets/seminar.jpg";
import cashier from "@/assets/cashier.jpg";
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


  return (
    <section ref={scene} className="welcome-hero" aria-labelledby="welcome-title">
      <div className="welcome-copy">
        <h1 id="welcome-title">Добро пожаловать в&nbsp;кассовый сервис</h1>
        <p>Заботимся о&nbsp;технологиях, пока вы заботитесь о&nbsp;клиентах</p>
        <Button asChild className="welcome-contact">
          <Link to="/support"><MessageCircle />Обратиться в поддержку<ArrowUpRight /></Link>
        </Button>
      </div>
      <div className="team-scene" aria-label="Команда Мастер Касс и наши клиенты">
        <div className="team-photo team-photo-left">
          <div className="team-photo-float"><img src={seminar} alt="Семинар для предпринимателей по 54-ФЗ в Ростовской области" width={1284} height={943} /></div>
        </div>
        <div className="team-photo team-photo-right">
          <div className="team-photo-float"><img src={salon} alt="Улыбающаяся команда парикмахерской" width={1536} height={1024} /></div>
        </div>
        <div className="team-photo team-photo-center">
          <div className="team-photo-float"><img src={face} alt="Инженер сервиса Мастер Касс" width={1284} height={835} fetchPriority="high" /></div>
        </div>
        <div className="team-photo team-photo-bottom-left">
          <div className="team-photo-float"><img src={boutique} alt="Владелицы магазина одежды приветствуют гостей" width={1536} height={1024} /></div>
        </div>
        <div className="team-photo team-photo-bottom-right">
          <div className="team-photo-float"><img src={cashier} alt="Инженер сервиса помогает кассиру со смарт-терминалом" width={1101} height={818} /></div>
        </div>
      </div>
    </section>
  );
}