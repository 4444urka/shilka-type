import { defineKeyframes } from "@chakra-ui/react";

export const keyframes = defineKeyframes({
  counterAnimation: {
    "0%": { transform: "translateY(0)", opacity: "0%" },
    "25%": { transform: "translateY(0)", opacity: "100%" },
    "90%": { transform: "translateY(0)", opacity: "100%" },
    "100%": { transform: "translateY(-80px)", opacity: "0%" },
  },

  coinsDetailsAnimation: {
    "0%": { opacity: "0%" },
    "25%": { opacity: "100%" },
    "75%": { opacity: "100%" },
    "100%": { opacity: "0%" },
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
    from: { color: "var(--chakra-colors-color-palette-muted)" },
    to: { color: "var(--chakra-colors-primary-color)" },
  },

  // WebSocket и Leaderboard анимации
  pulse: {
    "0%, 100%": { opacity: 1 },
    "50%": { opacity: 0.5 },
  },
  slideInLeaderboard: {
    "0%": { transform: "translateX(-20px)", opacity: 0.7 },
    "50%": { transform: "translateX(5px)" },
    "100%": { transform: "translateX(0)", opacity: 1 },
  },
  bounceIn: {
    "0%": { transform: "scale(0) translateY(10px)", opacity: 0 },
    "50%": { transform: "scale(1.3) translateY(-2px)" },
    "100%": { transform: "scale(1) translateY(0)", opacity: 1 },
  },
  highlight: {
    "0%": { boxShadow: "0 0 0 0 rgba(var(--primary-color-rgb), 0.5)" },
    "50%": { boxShadow: "0 0 15px 5px rgba(var(--primary-color-rgb), 0.3)" },
    "100%": { boxShadow: "0 0 0 0 rgba(var(--primary-color-rgb), 0)" },
  },

  coinsAdded: {
    from: { color: "var(--chakra-colors-success-color)" },
    to: { filter: "blur(0px)" },
  },
  coinsRemoved: {
    from: { color: "var(--chakra-colors-error-color)" },
    to: { filter: "blur(0px)" },
  },
});
