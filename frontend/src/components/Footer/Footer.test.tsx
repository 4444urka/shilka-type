import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "../../theme";

describe("Footer", () => {
  it("должен содержать ссылку на GitHub", () => {
    render(
      <BrowserRouter>
        <ChakraProvider value={system}>
          <Footer />
        </ChakraProvider>
      </BrowserRouter>
    );

    const githubLink = screen
      .getAllByRole("link")
      .find((link) =>
        link.getAttribute("href")?.includes("github.com/4444urka/shilka-type")
      );

    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("должен содержать ссылку на Telegram", () => {
    render(
      <BrowserRouter>
        <ChakraProvider value={system}>
          <Footer />
        </ChakraProvider>
      </BrowserRouter>
    );

    const telegramLink = screen
      .getAllByRole("link")
      .find((link) => link.getAttribute("href")?.includes("t.me/shilka_god"));

    expect(telegramLink).toBeInTheDocument();
    expect(telegramLink).toHaveAttribute("target", "_blank");
    expect(telegramLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
