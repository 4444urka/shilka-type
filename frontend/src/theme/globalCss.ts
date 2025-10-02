import { defineGlobalStyles } from "@chakra-ui/react";

export const globalCss = defineGlobalStyles({
  body: {
    color: { _light: "gray.800", _dark: "gray.100" },
    bg: { _light: "white", _dark: "bgPage" },
    lineHeight: "tall",
    transition: "background-color 0.2s, color 0.2s",
  },
});
