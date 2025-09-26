import type { TypedChar } from "./TypedChar";

export type TypingSessionState = {
  words: string[];
  isLoading: boolean;
  time: number;
  isStartedTyping: boolean;
  activeWordIndex: number;
  currentCharIndex: number;
  typedChars: TypedChar[];
  wordHistory: TypedChar[][];
};
