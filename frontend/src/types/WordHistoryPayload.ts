export type WordHistoryPayload = {
  words: string[];
  history: Array<Array<{ char: string; correct: boolean; time: number }>>;
  duration?: number;
};
