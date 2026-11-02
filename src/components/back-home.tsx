import { Link } from "@tanstack/react-router";
import { ChevronLeft, LogIn } from "lucide-react";

/** Верхняя полупрозрачная вуаль: слева кружок возврата на главную, справа (по желанию) кнопка «Войти». */
export function BackHome({ showLogin = false }: { showLogin?: boolean }) {
  return (
    <div className="mk-top-veil">
      <Link to="/" className="mk-back-home" aria-label="Вернуться на главную">
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
