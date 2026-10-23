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
