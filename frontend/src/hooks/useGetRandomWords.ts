import React from "react";
import {
  getRandomWords,
  getRandomSentences,
} from "../api/content/contentRequests";

type LanguageCode = "ru" | "en";
type ModeType = "words" | "sentences";

const useGetRandomWords = (
  minLength: number,
  maxLength: number,
  totalChars: number,
  languageCode: LanguageCode,
  mode: ModeType = "words"
) => {
  const [words, setWords] = React.useState<string[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadWords = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const estimatedWordCount = Math.ceil(
          totalChars / ((minLength + maxLength) / 2)
        );
        if (mode === "sentences") {
          // Режим предложений - получаем предложения с сервера
          const sentences = await getRandomSentences(languageCode, 10);
          // Разбиваем предложения на слова для отображения
          const allWords = sentences.flatMap((sentence) =>
            sentence.text.split(/\s+/).filter((word) => word.length > 0)
          );
          setWords(allWords.slice(0, estimatedWordCount));
        } else {
          // Режим слов - получаем слова с сервера
          // Вычисляем примерное количество слов исходя из totalChars
          const serverWords = await getRandomWords(
            languageCode,
            estimatedWordCount
          );
          setWords(serverWords.map((w) => w.text));
        }
      } catch (err) {
        console.error("Failed to load words from server:", err);
        setError("Failed to load words. Please try again.");
        // Fallback: устанавливаем пустой массив
        setWords([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadWords();
  }, [minLength, languageCode, maxLength, totalChars, refreshKey, mode]);

  const refreshWords = React.useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const addMoreWords = React.useCallback(
    async (charsToAdd?: number) => {
      const charsCount = charsToAdd || totalChars;

      try {
        let newWords: string[] = [];

        if (mode === "sentences") {
          // Загружаем дополнительные предложения
          const sentences = await getRandomSentences(languageCode, 5);
          newWords = sentences.flatMap((sentence) =>
            sentence.text.split(/\s+/).filter((word) => word.length > 0)
          );
        } else {
          // Загружаем дополнительные слова
          const estimatedWordCount = Math.ceil(
            charsCount / ((minLength + maxLength) / 2)
          );
          const serverWords = await getRandomWords(
            languageCode,
            Math.max(estimatedWordCount, 25)
          );
          newWords = serverWords.map((w) => w.text);
        }

        setWords((prev) => [...prev, ...newWords]);
      } catch (err) {
        console.error("Failed to add more words:", err);
      }
    },
    [minLength, languageCode, maxLength, totalChars, mode]
  );

  return { words, refreshWords, addMoreWords, isLoading, error };
};

export default useGetRandomWords;
