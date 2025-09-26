import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { textStyles } from "./textStyles";

const config = defineConfig({
  globalCss: {
    body: {
      color: "gray.800",
      lineHeight: "tall",
    },
  },
  theme: {
    textStyles,
    semanticTokens: {
      colors: {
        primaryColor: { value: "{colors.cyan.500}" },
      },
    },
    tokens: {
      durations: {
        fast: { value: "150ms" },
        normal: { value: "250ms" },
        slow: { value: "500ms" },
        slower: { value: "1000ms" },
      },
      easings: {
        ease: { value: "ease" },
        easeIn: { value: "ease-in" },
        easeOut: { value: "ease-out" },
        easeInOut: { value: "ease-in-out" },
      },
    },
    keyframes: {
      blink: {
        "0%, 100%": { opacity: 1 },
        "50%": { opacity: 0 },
      },
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      fadeOut: {
        from: { opacity: 1 },
        to: { opacity: 0 },
      },
      slideIn: {
        from: { transform: "translateY(-10px)", opacity: 0 },
        to: { transform: "translateY(0)", opacity: 1 },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
