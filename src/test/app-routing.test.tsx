import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, rootRouteId, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches a page for /privacy, where the request form points", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/privacy");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});

function renderPage(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { queryClient: new QueryClient() },
  });
  return render(<RouterProvider router={router} />);
}

describe("Legal and return links", () => {
  afterEach(cleanup);

  it("sends both footer legal links to the privacy page", () => {
    renderPage("/");

    for (const label of ["Политика конфиденциальности", "Согласие на обработку персональных данных"]) {
      expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", "/privacy");
    }
  });

  it("returns from the privacy page to the request form, not to the home page", () => {
    renderPage("/privacy");

    expect(screen.getByRole("link", { name: "Вернуться к подаче заявки" })).toHaveAttribute(
      "href",
      "/service#request",
    );
  });
});
