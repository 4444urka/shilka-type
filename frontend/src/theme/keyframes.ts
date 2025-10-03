import { defineKeyframes } from "@chakra-ui/react";

export const keyframes = defineKeyframes({
  counterAnimation: {
    "0%": { transform: "translateY(0)", opacity: "0%" },
    "75%": { transform: "translateY(0)", opacity: "100%" },
    "100%": { transform: "translateY(-80px)", opacity: "0%" },
  },

  blink: {
    "0%, 100%": { opacity: 1 },
    "50%": { opacity: 0 },
  },
  dropDown: {
    from: { transform: "translateY(-100px)", opacity: 0 },
    to: { transform: "translateY(0)", opacity: 1 },
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
  cursorSlide: {
    from: { transform: "translateX(0px)" },
    to: { transform: "translateX(4px)" },
  },
  primaryColorChange: {
    from: { color: "#d1d5db" },
    to: { color: "#06b6d4" },
  },
});
