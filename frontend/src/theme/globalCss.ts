import { defineGlobalStyles } from "@chakra-ui/react";

export const globalCss = defineGlobalStyles({
  "html, body": {
    color: "textColor",
    bg: "bgPage",
    lineHeight: "tall",
    transition: "background-color 0.2s, color 0.5s",
    fontSize: { base: "md", md: "sm", xl: "md" },
    margin: 0,
    padding: 0,
  },
});
