import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

/** Стеклянный кружок с стрелкой назад: всегда доступен в углу экрана, возврат на главную. */
export function BackHome() {
  return (
    <Link to="/" className="mk-back-home" aria-label="Вернуться на главную">
      <ArrowLeft aria-hidden="true" />
    </Link>
  );
}
