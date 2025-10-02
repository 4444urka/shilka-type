import type { TypingSession } from "../types/TypingSession";

export const calculateTotalStats = (sessions: TypingSession[]) => {
  return sessions.reduce(
    (acc, session) => {
      // Приблизительное количество правильных символов: WPM * 5 * минуты
      const minutes = (session.duration || 0) / 60;
      const approximateCorrectChars = Math.round(session.wpm * 5 * minutes);

      return {
        totalCharsTyped: acc.totalCharsTyped + approximateCorrectChars,
        totalTimeTyping: acc.totalTimeTyping + (session.duration || 0),
      };
    },
    { totalCharsTyped: 0, totalTimeTyping: 0 }
  );
};
