<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the welcome photo scene in a browser-safe standalone React component with CSS perspective and scroll effects; it remains replaceable without changing the lower page sections.
- Scope welcome-screen colors to semantic CSS tokens so its light palette does not recolor the existing service and pricing sections.
- Home page sections below the welcome scene live in src/components/home-sections.tsx, styled via scoped --mk-* tokens; the bottom wrapper .mk-tail carries the spectrum gradient so blocks can be reordered without touching the hero.
- The day-in-the-life comic renders inline as a full magazine spread at the end of the service page (src/components/day-comic.tsx), never behind a preview button or in a dialog, and panels are laid out in justified rows that keep each artwork's own aspect ratio (.mk-comic-row), because cropping cuts the speech bubbles baked into the artwork.
- Inner pages return to the home page through the shared src/components/back-home.tsx circle (.mk-back-home) pinned in the screen corner, not a text link at the top of the article, so the way back stays reachable without scrolling up.
- .mk-card is unlayered CSS with display:block, so it beats Tailwind's flex utility; a card that needs flex layout (like bottom-aligned footnotes) must declare display:flex in its own .mk-* class in src/styles.css.
- Tariff data and AI-unit numbers live in src/lib/tariffs.ts and are asserted by src/lib/tariffs.test.ts; change the figures only together with the billing decision they come from.
- FAQ items in src/components/home-sections.tsx are {q, a: string[]} objects and every answer paragraph renders as its own <p>, so long trust answers stay readable on phones; add new questions in that same shape.
- Evotor cash-register data reaches cabinets only through the server function in src/lib/evotor.functions.ts (token in a server secret) with pure math in src/lib/evotor.ts, so the token never reaches the browser and the sums stay testable.
- Evotor/Bitrix24 server logic lives in src/lib/evotor.server.ts and is shared by server functions and the scheduled route /api/public/cron/link-check (Bearer CRON_SECRET); Bitrix24 itself is the dedup log (task search for the last 24h), because worker memory does not persist between runs.
- Эвотор: чеки на /api/public/evotor/receipts (токен EVOTOR_WEBHOOK_TOKEN), расчёт баллов в src/lib/evotor-receipt.ts; балансы МК Бонус хранятся в mk_guests, история в mk_bonus_ops; один чек меняет баланс один раз (функция mk_apply_bonus); баланс для кассы — /api/public/mk-bonus/balance.
- МК Бонус для кассы: списание через /api/public/mk-bonus/redeem (функция mk_redeem_bonus, requestId защищает от двойного списания), лимит в src/lib/mk-bonus.ts; подключения Эвотора — /api/public/evotor/events (mk_evotor_accounts), кассы — /api/public/evotor/devices (mk_devices); все адреса проверяют EVOTOR_WEBHOOK_TOKEN.
- Persist validated, normalized contacts in trial sessions and resume past contacts only with a valid phone; this keeps every signup entry path compatible with Evotor link validation.
