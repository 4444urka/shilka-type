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

  // Глобальные улучшения для мобильных
  "*": {
    WebkitTapHighlightColor: "transparent",
  },

  html: {
    WebkitOverflowScrolling: "touch",
    touchAction: "manipulation",
    // Адаптивная типографика
    "@media (max-width: 768px)": {
      fontSize: "14px",
    },
    "@media (max-width: 480px)": {
      fontSize: "13px",
    },
  },

  body: {
    overscrollBehaviorY: "none",
  },

  // Typed cursor styling
  ".typed-cursor": {
    color: "primaryColor",
    width: "2px",
  },

  // Улучшенные скроллбары
  "::-webkit-scrollbar": {
    width: "8px",
    height: "8px",
  },

  "::-webkit-scrollbar-track": {
    background: "transparent",
  },

  "::-webkit-scrollbar-thumb": {
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "4px",
  },

  "::-webkit-scrollbar-thumb:hover": {
    background: "rgba(255, 255, 255, 0.3)",
  },

  // Улучшение доступности кнопок на мобильных (44x44px минимум)
  "button, [role='button'], a": {
    minWidth: "44px",
    minHeight: "44px",
  },

  // Улучшение фокуса для клавиатурной навигации
  "*:focus-visible": {
    outline: "2px solid",
    outlineColor: "primaryColor",
    outlineOffset: "2px",
  },

  // Скрываем outline для мышиных кликов
  "*:focus:not(:focus-visible)": {
    outline: "none",
  },
});
