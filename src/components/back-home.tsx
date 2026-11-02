import { Link } from "@tanstack/react-router";
import { ChevronLeft, LogIn } from "lucide-react";

/**
 * Верхняя полупрозрачная вуаль: слева кружок возврата, справа (по желанию) кнопка «Войти».
 * destination="request" ведёт кружок к плашке «Подать заявку на сервис», по умолчанию — на главную.
 */
export function BackHome({
  showLogin = false,
  destination = "home",
}: {
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
      {showLogin && (
        <Link to="/login" className="mk-veil-login">
          <LogIn aria-hidden="true" />
          Войти
        </Link>
      )}
    </div>
  );
}
