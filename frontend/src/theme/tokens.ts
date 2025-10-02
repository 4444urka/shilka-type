import { defineTokens } from "@chakra-ui/react";

export const tokens = defineTokens({
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
});
