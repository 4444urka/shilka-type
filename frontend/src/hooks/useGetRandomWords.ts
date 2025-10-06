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
        (async () => {
          setWords(
            await getRandomLengthWords(totalChars, minLength, maxLength)
          );
        })();
      }
    } else {
      // Режим слов
      if (languageCode === "en") {
        (async () => {
          setWords(
            await getRandomLengthWords(totalChars, minLength, maxLength)
          );
        })();
      } else {
        const newWords = getRandomRussianWords(
          minLength,
          maxLength,
          totalChars
        );
        setWords(newWords);
      }
    }
  }, [minLength, languageCode, maxLength, totalChars, refreshKey, mode]);

  const refreshWords = React.useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return { words, refreshWords };
};

export default useGetRandomWords;
