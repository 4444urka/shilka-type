/**
 * Утилиты для красивого отображения информации о сессиях набора
 */

export interface ModeDisplay {
  label: string;
  color: string;
  icon: string;
}

export interface LanguageDisplay {
  label: string;
  flag: string;
  color: string;
}

/**
 * Получить красивое отображение режима набора
 */
export const getModeDisplay = (mode: string | null): ModeDisplay => {
  const modes: Record<string, ModeDisplay> = {
    words: {
      label: "Слова",
      color: "blue.500",
      icon: "📝",
    },
    sentences: {
      label: "Предложения",
      color: "teal.500",
      icon: "📜",
    },
    time: {
      label: "Время",
      color: "green.500",
      icon: "⏱️",
    },
    quote: {
      label: "Цитата",
      color: "purple.500",
      icon: "💬",
    },
    zen: {
      label: "Дзен",
      color: "orange.500",
      icon: "🧘",
    },
  };

  return (
    modes[mode || ""] || {
      label: mode || "Неизвестно",
      color: "gray.500",
      icon: "❓",
    }
  );
};

/**
 * Получить красивое отображение языка
 */
export const getLanguageDisplay = (
  language: string | null
): LanguageDisplay => {
  const languages: Record<string, LanguageDisplay> = {
    ru: {
      label: "Русский",
      flag: "🇷🇺",
      color: "red.500",
    },
    en: {
      label: "English",
      flag: "🇺🇸",
      color: "blue.500",
    },
    de: {
      label: "Deutsch",
      flag: "🇩🇪",
      color: "yellow.600",
    },
    fr: {
      label: "Français",
      flag: "🇫🇷",
      color: "blue.400",
    },
    es: {
      label: "Español",
      flag: "🇪🇸",
      color: "red.400",
    },
    it: {
      label: "Italiano",
      flag: "🇮🇹",
      color: "green.500",
    },
  };

  return (
    languages[language || ""] || {
      label: language || "Неизвестно",
      flag: "🌐",
      color: "gray.500",
    }
  );
};
