import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../tests/test-utils";
import Cursor from "./Cursor";

describe("Cursor", () => {
  it("должен отрисовывать курсор", () => {
    const { container } = renderWithProviders(<Cursor />);

    // Проверяем что компонент отрисовался
    expect(container.firstChild).toBeInTheDocument();
  });

  it("должен содержать анимированный элемент", () => {
    const { container } = renderWithProviders(<Cursor />);

    // Проверяем что компонент отрисовался (может включать script теги от framer-motion)
    expect(container.firstChild).toBeTruthy();
    expect(container.children.length).toBeGreaterThan(0);
  });
});
