export type TypingSession = {
  id: number;
  wpm: number;
  accuracy: number;
  duration: number | null;
  typing_mode: string | null;
  language: string | null;
  test_type: string | null;
  created_at: string;
};
