export interface TypingChar {
  char: string;
  correct: boolean;
  typed: boolean;
}

export interface TypingWord {
  text: string;
  chars: TypingChar[];
  completed: boolean;
  active: boolean;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
}

export interface TypingSessionNew {
  words: TypingWord[];
  currentWordIndex: number;
  currentCharIndex: number;
  initialTime: number;
  startTime: number | null;
  endTime: number | null;
  isStarted: boolean;
  isCompleted: boolean;
  stats: TypingStats;
}

export interface CursorPosition {
  wordIndex: number;
  charIndex: number;
  x: number;
  y: number;
}
