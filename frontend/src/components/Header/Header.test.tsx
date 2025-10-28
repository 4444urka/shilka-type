import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../tests/test-utils";
import { screen } from "@testing-library/react";
import Header from "./Header";
import { useIsAuthed } from "../../hooks/useIsAuthed";

// Мокируем хук useIsAuthed
vi.mock("../../hooks/useIsAuthed");

// Мокируем typed.js
vi.mock("typed.js", () => {
  // export a class so `new Typed(...)` returns an instance with destroy()
  return {
    default: class {
      constructor() {}
      destroy() {
        return undefined;
      }
    },
  };
});

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("должен отрисовывать Header", () => {
    vi.mocked(useIsAuthed).mockReturnValue(false);

    const { container } = renderWithProviders(<Header />);

    // Проверяем что есть ссылка на главную (по href, т.к. текст генерируется Typed.js)
    const homeLink = container.querySelector('a[href="/"]');
    expect(homeLink).toBeInTheDocument();
  });

  it("должен показывать ссылку на /signin когда пользователь не авторизован", () => {
    vi.mocked(useIsAuthed).mockReturnValue(false);

    renderWithProviders(<Header />);

    const statsButton = screen.getByRole("button", { name: "Stats" });
    expect(statsButton.closest("a")).toHaveAttribute("href", "/signin");
  });

  it("должен показывать ссылку на /stats когда пользователь авторизован", () => {
    vi.mocked(useIsAuthed).mockReturnValue(true);

    renderWithProviders(<Header />);

    const statsButton = screen.getByRole("button", { name: "Stats" });
    expect(statsButton.closest("a")).toHaveAttribute("href", "/stats");
  });
});
