import { defineGlobalStyles } from "@chakra-ui/react";

export const globalCss = defineGlobalStyles({
  "html, body": {
    color: "textColor",
    bg: "bgPage",
    lineHeight: "tall",
    transition: "background-color 0.2s, color 0.5s",
    margin: 0,
    padding: 0,
  },
});
