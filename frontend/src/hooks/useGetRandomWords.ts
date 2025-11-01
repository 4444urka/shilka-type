import React from "react";
import { getRandomRussianWords } from "../utils/getRandomRussianWords";
import { getRandomRussianSentences } from "../utils/getRandomRussianSentences";
import { getRandomLengthWords } from "../services/randomWordsService";

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

  React.useEffect(() => {
    const loadWords = async () => {
      if (mode === "sentences") {
        // Режим предложений (только для русского языка)
        if (languageCode === "ru") {
          const sentences = getRandomRussianSentences(totalChars + 50);
          // Разбиваем предложения на слова
          const allWords = sentences.flatMap((sentence) =>
            sentence.split(/\s+/).filter((word) => word.length > 0)
          );
          setWords(allWords);
        } else {
          // Для английского языка в режиме предложений используем слова
          const newWords = await getRandomLengthWords(
            totalChars,
            minLength,
            maxLength
          );
          setWords(newWords);
        }
      } else {
        // Режим слов
        if (languageCode === "en") {
          const newWords = await getRandomLengthWords(
            totalChars,
            minLength,
            maxLength
          );
          setWords(newWords);
        } else {
          const newWords = getRandomRussianWords(
            minLength,
            maxLength,
            totalChars
          );
          setWords(newWords);
        }
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
      let newWords: string[] = [];

      if (mode === "sentences") {
        if (languageCode === "ru") {
          const sentences = getRandomRussianSentences(charsCount + 50);
          newWords = sentences.flatMap((sentence) =>
            sentence.split(/\s+/).filter((word) => word.length > 0)
          );
        } else {
          newWords = await getRandomLengthWords(
            charsCount,
            minLength,
            maxLength
          );
        }
      } else {
        if (languageCode === "en") {
          newWords = await getRandomLengthWords(
            charsCount,
            minLength,
            maxLength
          );
        } else {
          newWords = getRandomRussianWords(minLength, maxLength, charsCount);
        }
      }

      setWords((prev) => [...prev, ...newWords]);
    },
    [minLength, languageCode, maxLength, totalChars, mode]
  );

  return { words, refreshWords, addMoreWords };
};

export default useGetRandomWords;
