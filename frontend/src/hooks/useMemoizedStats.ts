import { useMemo } from "react";
import type { TypingSession } from "../types/TypingSession";

interface TotalStats {
  totalCharsTyped: number;
  totalTimeTyping: number;
  averageWpm: number;
  averageAccuracy: number;
  bestWpm: number;
  totalSessions: number;
}

interface SessionStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
}

/**
 * Hook for memoizing expensive stat calculations
 * Prevents unnecessary recalculations when dependencies haven't changed
 */
export const useMemoizedStats = (sessions: TypingSession[]): TotalStats => {
  return useMemo(() => {
    if (sessions.length === 0) {
      return {
        totalCharsTyped: 0,
        totalTimeTyping: 0,
        averageWpm: 0,
        averageAccuracy: 0,
        bestWpm: 0,
        totalSessions: 0,
      };
    }

    let totalCharsTyped = 0;
    let totalTimeTyping = 0;
    let totalWpm = 0;
    let totalAccuracy = 0;
    let bestWpm = 0;

    for (const session of sessions) {
      // Approximate correct characters: WPM * 5 * minutes
      const minutes = (session.duration || 0) / 60;
      const approximateCorrectChars = Math.round(session.wpm * 5 * minutes);

      totalCharsTyped += approximateCorrectChars;
      totalTimeTyping += session.duration || 0;
      totalWpm += session.wpm;
      totalAccuracy += session.accuracy;

      if (session.wpm > bestWpm) {
        bestWpm = session.wpm;
      }
    }

    const sessionCount = sessions.length;

    return {
      totalCharsTyped,
      totalTimeTyping,
      averageWpm: Math.round(totalWpm / sessionCount),
      averageAccuracy: Math.round(totalAccuracy / sessionCount),
      bestWpm,
      totalSessions: sessionCount,
    };
  }, [sessions]);
};

/**
 * Memoize real-time session stats calculation
 */
export const useMemoizedSessionStats = (
  correctChars: number,
  incorrectChars: number,
  elapsedTimeMs: number,
): SessionStats => {
  return useMemo(() => {
    const totalChars = correctChars + incorrectChars;
    const accuracy =
      totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

    const minutes = elapsedTimeMs / 1000 / 60;
    const wpm = minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;

    return {
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars,
    };
  }, [correctChars, incorrectChars, elapsedTimeMs]);
};

/**
 * Memoize chart data transformation for sessions
 */
export const useMemoizedChartData = (
  sessions: TypingSession[],
): Array<{ date: string; wpm: number; accuracy: number }> => {
  return useMemo(() => {
    return sessions.map((session) => ({
      date: new Date(session.created_at).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
      }),
      wpm: session.wpm,
      accuracy: session.accuracy,
    }));
  }, [sessions]);
};

export default useMemoizedStats;
