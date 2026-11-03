import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { sections } from "@/lib/privacy-sections";

/** Ссылка под формами: политика открывается окном с крестиком, человек остаётся у своей формы. */
export function PrivacyLink() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="mk-privacy-link">Политике обработки персональных данных</button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-left text-2xl tracking-[-0.03em]">Политика обработки персональных данных</DialogTitle>
          <DialogDescription className="text-left">
            Оператор: Сервисный центр «Мастер Касс», Ростов-на-Дону. Обращения обрабатываются в «Битрикс24», серверы в России.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {sections.map((s) => (
            <section key={s.n}>
              <h3 className="text-base font-semibold">{s.n}</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                {s.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
