import { Link } from "@tanstack/react-router";
import { ChevronLeft, LogIn } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

/**
 * Верхняя полупрозрачная вуаль: слева кружок возврата, справа (по желанию) кнопка «Войти».
 * destination="request" ведёт кружок к плашке «Подать заявку на сервис», по умолчанию — на главную.
 */
export function BackHome({
  showLogin = false,
  destination = "home",
  brand = false,
}: {
  brand?: boolean;
  showLogin?: boolean;
  destination?: "home" | "request";
}) {
  return (
    <div className="mk-top-veil">
      {destination === "request" ? (
        <Link to="/service" hash="request" className="mk-back-home" aria-label="Вернуться к подаче заявки">
          <ChevronLeft aria-hidden="true" />
        </Link>
      ) : (
        <Link to="/" className="mk-back-home" aria-label="Вернуться на главную">
          <ChevronLeft aria-hidden="true" />
        </Link>
      )}
      {brand && <span className="mk-veil-brand"><BrandMark size={24} />МастерКасс</span>}
      {showLogin && (
        <Link to="/login" className="mk-veil-login">
          <LogIn aria-hidden="true" />
          Войти
        </Link>
      )}
    </div>
  );
}
