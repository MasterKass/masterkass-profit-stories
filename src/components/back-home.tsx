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
  const isRequest = destination === "request";
  return (
    <div className="mk-top-veil">
      <Link
        to={isRequest ? "/service" : "/"}
        hash={isRequest ? "request" : undefined}
        className="mk-back-home"
        aria-label={isRequest ? "Вернуться к подаче заявки" : "Вернуться на главную"}
      >
        <ChevronLeft aria-hidden="true" />
      </Link>
      {showLogin && (
        <Link to="/login" className="mk-veil-login">
          <LogIn aria-hidden="true" />
          Войти
        </Link>
      )}
    </div>
  );
}
