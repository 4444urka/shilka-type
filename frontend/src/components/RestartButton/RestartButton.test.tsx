import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../tests/test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RestartButton from "./RestartButton";

describe("RestartButton", () => {
  it("должен отрисовывать кнопку с иконкой", () => {
    const handleClick = vi.fn();
    renderWithProviders(<RestartButton onClick={handleClick} />);

    const button = screen.getByRole("button", { name: "Restart" });
    expect(button).toBeInTheDocument();
  });

  it("должен вызывать onClick при клике", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<RestartButton onClick={handleClick} />);

    const button = screen.getByRole("button", { name: "Restart" });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("должен быть disabled когда указано", () => {
    const handleClick = vi.fn();
    renderWithProviders(<RestartButton onClick={handleClick} disabled />);

    const button = screen.getByRole("button", { name: "Restart" });
    expect(button).toBeDisabled();
  });

  it("не должен вызывать onClick когда disabled", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<RestartButton onClick={handleClick} disabled />);

    const button = screen.getByRole("button", { name: "Restart" });
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
