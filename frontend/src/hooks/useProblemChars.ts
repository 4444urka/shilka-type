import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchCharErrors } from "../api/stats/statsRequests";
import type { CharErrorResponse } from "../types/CharErrorResponse";

interface UseProblemCharsOptions {
  /** Minimum error rate to consider a character problematic (0-100) */
  minErrorRate?: number;
  /** Maximum number of problem characters to return */
  maxChars?: number;
  /** Whether to fetch data automatically */
  autoFetch?: boolean;
}

interface UseProblemCharsReturn {
  /** List of problematic characters sorted by error rate (highest first) */
  problemChars: CharErrorResponse[];
  /** All character error statistics */
  allCharStats: CharErrorResponse[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Refetch the data */
  refetch: () => Promise<void>;
  /** Get a set of problem characters for quick lookup */
  problemCharSet: Set<string>;
  /** Check if a character is problematic */
  isProblemChar: (char: string) => boolean;
  /** Get error rate for a specific character */
  getErrorRate: (char: string) => number | null;
}

/**
 * Hook for fetching and managing problematic character statistics
 * Useful for highlighting problem areas and creating targeted practice sessions
 */
export const useProblemChars = ({
  minErrorRate = 10,
  maxChars = 10,
  autoFetch = true,
}: UseProblemCharsOptions = {}): UseProblemCharsReturn => {
  const [allCharStats, setAllCharStats] = useState<CharErrorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchCharErrors();
      // Sort by error rate descending
      const sorted = [...data].sort((a, b) => b.error_rate - a.error_rate);
      setAllCharStats(sorted);
    } catch (err) {
      console.error("Failed to fetch character error stats:", err);
      setError("Не удалось загрузить статистику ошибок");
      setAllCharStats([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      void fetchData();
    }
  }, [autoFetch, fetchData]);

  // Filter to only problem characters
  const problemChars = useMemo(() => {
    return allCharStats
      .filter((stat) => stat.error_rate >= minErrorRate)
      .slice(0, maxChars);
  }, [allCharStats, minErrorRate, maxChars]);

  // Create a Set for quick lookup
  const problemCharSet = useMemo(() => {
    return new Set(problemChars.map((stat) => stat.char));
  }, [problemChars]);

  // Check if a character is problematic
  const isProblemChar = useCallback(
    (char: string): boolean => {
      return problemCharSet.has(char);
    },
    [problemCharSet]
  );

  // Get error rate for a specific character
  const getErrorRate = useCallback(
    (char: string): number | null => {
      const stat = allCharStats.find((s) => s.char === char);
      return stat ? stat.error_rate : null;
    },
    [allCharStats]
  );

  return {
    problemChars,
    allCharStats,
    isLoading,
    error,
    refetch: fetchData,
    problemCharSet,
    isProblemChar,
    getErrorRate,
  };
};

export default useProblemChars;
