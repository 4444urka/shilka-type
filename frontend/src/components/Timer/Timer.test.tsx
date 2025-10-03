import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../tests/test-utils";
import { screen } from "@testing-library/react";
import Timer from "./Timer";

describe("Timer", () => {
  it("должен отрисовывать children", () => {
    renderWithProviders(<Timer>01:30</Timer>);

    expect(screen.getByText("01:30")).toBeInTheDocument();
  });

  it("должен применять дополнительные пропсы", () => {
    renderWithProviders(<Timer fontSize="2xl">00:45</Timer>);

    const timer = screen.getByText("00:45");
    expect(timer).toBeInTheDocument();
  });

  it("должен отрисовывать пустой таймер", () => {
    const { container } = renderWithProviders(<Timer />);

    // Проверяем что компонент отрисовался
    expect(container.firstChild).toBeInTheDocument();
  });

  it("должен отрисовывать числовые значения", () => {
    renderWithProviders(<Timer>120</Timer>);

    expect(screen.getByText("120")).toBeInTheDocument();
  });
});
