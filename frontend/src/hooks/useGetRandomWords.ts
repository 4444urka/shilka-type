import React from "react";
import {
  getRandomWords,
  getRandomSentences,
  getWordsWithProblemChars,
} from "../api/content/contentRequests";
import { fetchCharErrors } from "../api/stats/statsRequests";

type LanguageCode = "ru" | "en";
type ModeType = "words" | "sentences" | "problem";

const useGetRandomWords = (
  minLength: number,
  maxLength: number,
  totalChars: number,
  languageCode: LanguageCode,
  mode: ModeType = "words",
) => {
  const [words, setWords] = React.useState<string[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Cache problem chars to avoid fetching them on every refresh
  const problemCharsRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const loadWords = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const estimatedWordCount = Math.ceil(
          totalChars / ((minLength + maxLength) / 2),
        );

        if (mode === "problem") {
          // Problem mode - get words containing problematic characters
          let problemChars = problemCharsRef.current;

          // Fetch problem chars if not cached or on first load
          if (!problemChars) {
            try {
              const charErrors = await fetchCharErrors();
              // Get top 5 most problematic characters (error_rate > 5%)
              const topProblemChars = charErrors
                .filter((stat) => stat.error_rate > 5)
                .slice(0, 5)
                .map((stat) => stat.char)
                .join("");

              problemChars = topProblemChars || "";
              problemCharsRef.current = problemChars;
            } catch {
              // If fetching char errors fails, fall back to regular words
              console.warn(
                "Failed to fetch problem chars, using regular words",
              );
              problemChars = "";
            }
          }

          if (problemChars && problemChars.length > 0) {
            const serverWords = await getWordsWithProblemChars(
              problemChars,
              languageCode,
              estimatedWordCount,
            );
            setWords(serverWords.map((w) => w.text));
          } else {
            // No problem chars found, fall back to regular words
            const serverWords = await getRandomWords(
              languageCode,
              estimatedWordCount,
            );
            setWords(serverWords.map((w) => w.text));
          }
        } else if (mode === "sentences") {
          // Sentences mode - get sentences from server
          const sentences = await getRandomSentences(languageCode, 10);
          // Split sentences into words for display
          const allWords = sentences.flatMap((sentence) =>
            sentence.text.split(/\s+/).filter((word) => word.length > 0),
          );
          setWords(allWords.slice(0, estimatedWordCount));
        } else {
          // Words mode - get words from server
          const serverWords = await getRandomWords(
            languageCode,
            estimatedWordCount,
          );
          setWords(serverWords.map((w) => w.text));
        }
      } catch (err) {
        console.error("Failed to load words from server:", err);
        setError("Failed to load words. Please try again.");
        // Fallback: set empty array
        setWords([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadWords();
  }, [minLength, languageCode, maxLength, totalChars, refreshKey, mode]);

  const refreshWords = React.useCallback(() => {
    // Clear problem chars cache on refresh to get fresh data
    if (mode === "problem") {
      problemCharsRef.current = null;
    }
    setRefreshKey((prev) => prev + 1);
  }, [mode]);

  const addMoreWords = React.useCallback(
    async (charsToAdd?: number) => {
      const charsCount = charsToAdd || totalChars;

      try {
        let newWords: string[] = [];

        if (mode === "problem") {
          // Load more problem words
          const problemChars = problemCharsRef.current || "";
          const estimatedWordCount = Math.ceil(
            charsCount / ((minLength + maxLength) / 2),
          );

          if (problemChars && problemChars.length > 0) {
            const serverWords = await getWordsWithProblemChars(
              problemChars,
              languageCode,
              Math.max(estimatedWordCount, 25),
            );
            newWords = serverWords.map((w) => w.text);
          } else {
            const serverWords = await getRandomWords(
              languageCode,
              Math.max(estimatedWordCount, 25),
            );
            newWords = serverWords.map((w) => w.text);
          }
        } else if (mode === "sentences") {
          // Load more sentences
          const sentences = await getRandomSentences(languageCode, 5);
          newWords = sentences.flatMap((sentence) =>
            sentence.text.split(/\s+/).filter((word) => word.length > 0),
          );
        } else {
          // Load more words
          const estimatedWordCount = Math.ceil(
            charsCount / ((minLength + maxLength) / 2),
          );
          const serverWords = await getRandomWords(
            languageCode,
            Math.max(estimatedWordCount, 25),
          );
          newWords = serverWords.map((w) => w.text);
        }

        setWords((prev) => [...prev, ...newWords]);
      } catch (err) {
        console.error("Failed to add more words:", err);
      }
    },
    [minLength, languageCode, maxLength, totalChars, mode],
  );

  return { words, refreshWords, addMoreWords, isLoading, error };
};

export default useGetRandomWords;
