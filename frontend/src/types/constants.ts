/**
 * Common constants and utility types for the Shilka Type application
 */

// ============================================================================
// Language Constants
// ============================================================================

export const SUPPORTED_LANGUAGES = ["en", "ru"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  ru: "Русский",
};

// ============================================================================
// Mode Constants
// ============================================================================

export const TYPING_MODES = ["words", "sentences", "problem"] as const;
export type TypingMode = (typeof TYPING_MODES)[number];

export const MODE_LABELS: Record<TypingMode, string> = {
  words: "Слова",
  sentences: "Предложения",
  problem: "Проблемные",
};

// ============================================================================
// Test Type Constants
// ============================================================================

export const TEST_TYPES = ["time", "words"] as const;
export type TestType = (typeof TEST_TYPES)[number];

export const TEST_TYPE_LABELS: Record<TestType, string> = {
  time: "Время",
  words: "Слова",
};

// ============================================================================
// Timing Options
// ============================================================================

export const TIME_OPTIONS = [15, 30, 60, 120] as const;
export type TimeOption = (typeof TIME_OPTIONS)[number];

export const WORDS_COUNT_OPTIONS = [10, 25, 50, 100] as const;
export type WordsCountOption = (typeof WORDS_COUNT_OPTIONS)[number];

// ============================================================================
// Default Settings
// ============================================================================

export const DEFAULT_SETTINGS = {
  time: 30 as TimeOption,
  words: 25 as WordsCountOption,
  language: "en" as SupportedLanguage,
  mode: "words" as TypingMode,
  testType: "time" as TestType,
} as const;

// ============================================================================
// Keyboard Shortcuts
// ============================================================================

export const RESTART_KEYS = ["Tab", "Escape"] as const;
export type RestartKey = (typeof RESTART_KEYS)[number];

// ============================================================================
// API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  ME: "/api/auth/me",
  LOGOUT: "/api/auth/logout",
  SETTINGS: "/api/auth/settings",

  // Stats
  LEADERBOARD: "/api/stats/leaderboard",
  TYPING_SESSION: "/api/stats/typing-session",
  TYPING_SESSIONS: "/api/stats/typing-sessions",
  CHAR_ERRORS: "/api/stats/char-errors",

  // Content
  WORDS: "/api/content/words",
  SENTENCES: "/api/content/sentences",
  PROBLEM_WORDS: "/api/content/words/problem",

  // WebSocket
  LEADERBOARD_WS: "/ws/leaderboard",
} as const;

// ============================================================================
// Local Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  SETTINGS: "shilka_settings",
  THEME: "shilka_theme",
  ACCESS_TOKEN: "access_token",
} as const;

// ============================================================================
// Animation Durations (ms)
// ============================================================================

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  FADE_IN: 500,
} as const;

// ============================================================================
// Typing Stats Thresholds
// ============================================================================

export const STATS_THRESHOLDS = {
  /** Minimum error rate to consider a character problematic (%) */
  PROBLEM_CHAR_MIN_ERROR_RATE: 5,
  /** Maximum number of problem characters to use for practice */
  MAX_PROBLEM_CHARS: 5,
  /** WPM considered "good" */
  GOOD_WPM: 60,
  /** WPM considered "excellent" */
  EXCELLENT_WPM: 100,
  /** Accuracy considered "good" (%) */
  GOOD_ACCURACY: 95,
  /** Accuracy considered "excellent" (%) */
  EXCELLENT_ACCURACY: 99,
} as const;

// ============================================================================
// Utility Types
// ============================================================================

/** Make all properties in T optional and nullable */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] | null;
};

/** Extract the type of array elements */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/** Make specific keys required */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Make specific keys optional */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// ============================================================================
// Type Guards
// ============================================================================

export const isValidLanguage = (value: unknown): value is SupportedLanguage => {
  return (
    typeof value === "string" &&
    SUPPORTED_LANGUAGES.includes(value as SupportedLanguage)
  );
};

export const isValidMode = (value: unknown): value is TypingMode => {
  return typeof value === "string" && TYPING_MODES.includes(value as TypingMode);
};

export const isValidTestType = (value: unknown): value is TestType => {
  return typeof value === "string" && TEST_TYPES.includes(value as TestType);
};

export const isValidTimeOption = (value: unknown): value is TimeOption => {
  return typeof value === "number" && TIME_OPTIONS.includes(value as TimeOption);
};

export const isValidWordsOption = (value: unknown): value is WordsCountOption => {
  return (
    typeof value === "number" &&
    WORDS_COUNT_OPTIONS.includes(value as WordsCountOption)
  );
};
