/* eslint-disable @typescript-eslint/no-explicit-any */
import { createShikiAdapter } from "@chakra-ui/react";
import type { HighlighterGeneric } from "shiki";

export const shikiAdapter = createShikiAdapter<HighlighterGeneric<any, any>>({
  async load() {
    const { createHighlighter } = await import("shiki");
    return createHighlighter({
      langs: ["tsx", "scss", "html", "bash", "json"],
      themes: ["github-light"],
    });
  },
  theme: "github-light",
});
