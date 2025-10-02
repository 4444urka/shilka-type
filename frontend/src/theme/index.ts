import { globalCss } from "./globalCss";
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { textStyles } from "./textStyles";
import { keyframes } from "./keyframes";
import { semanticTokens } from "./semanticTokens";
import { tokens } from "./tokens";

const config = defineConfig({
  globalCss,
  theme: {
    textStyles,
    semanticTokens,
    tokens,
    keyframes,
  },
});

export const system = createSystem(defaultConfig, config);
