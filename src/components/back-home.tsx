import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

/** Верхняя полупрозрачная вуаль без границы (растворяется книзу) с кружком возврата на главную. */
export function BackHome() {
  return (
    <div className="mk-top-veil">
      <Link to="/" className="mk-back-home" aria-label="Вернуться на главную">
        <ChevronLeft aria-hidden="true" />
      </Link>
    </div>
  );
}
