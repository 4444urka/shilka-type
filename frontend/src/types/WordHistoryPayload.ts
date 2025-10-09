export type WordHistoryPayload = {
  words: string[];
  history: Array<Array<{ char: string; correct: boolean; time: number }>>;
  duration?: number;
  wpm?: number; // WPM с фронтенда
  accuracy?: number; // Точность с фронтенда
  mode?: string; // режим набора (words, sentences, etc.)
  language?: string; // язык (ru, en, etc.)
  testType?: string; // тип теста (time, words)
};
