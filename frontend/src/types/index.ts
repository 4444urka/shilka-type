/**
 * Central export file for all types
 */

// User types
export type {
  User,
  UserRegistrationResponse,
  UserLoginResponse,
  UserRegistrationRequest,
  Me,
} from "./User";

// Typing session types
export type {
  TypingChar,
  TypingWord,
  TypingStats,
  TypingSessionNew,
  CursorPosition,
} from "./TypingTypes";

export type { TypingSession } from "./TypingSession";
export type { TypingSessionState } from "./TypingSessionState";
export type { UseTypingSessionOptions } from "./UseTypingSessionOptions";

// Character and word types
export type { TypedChar } from "./TypedChar";
export type { CharErrorResponse } from "./CharErrorResponse";
export type { WordHistoryPayload } from "./WordHistoryPayload";

// Theme types
export type { CustomThemeData } from "./CustomThemeData";
export type { UseThemeSelectorResult } from "./UseThemeSelectorResult";

// Auth types
export type { OAuth2PasswordRequestForm } from "./Oauth2PasswordRequestForm";

// Constants and utility types
export {
  // Language
  SUPPORTED_LANGUAGES,
  LANGUAGE_LABELS,
  // Mode
  TYPING_MODES,
  MODE_LABELS,
  // Test Type
  TEST_TYPES,
  TEST_TYPE_LABELS,
  // Options
  TIME_OPTIONS,
  WORDS_COUNT_OPTIONS,
  // Defaults
  DEFAULT_SETTINGS,
  // Keyboard
  RESTART_KEYS,
  // API
  API_ENDPOINTS,
  // Storage
  STORAGE_KEYS,
  // Animations
  ANIMATION_DURATIONS,
  // Stats
  STATS_THRESHOLDS,
  // Type guards
  isValidLanguage,
  isValidMode,
  isValidTestType,
  isValidTimeOption,
  isValidWordsOption,
} from "./constants";

export type {
  SupportedLanguage,
  TypingMode,
  TestType,
  TimeOption,
  WordsCountOption,
  RestartKey,
  DeepPartial,
  ArrayElement,
  RequireKeys,
  OptionalKeys,
} from "./constants";
