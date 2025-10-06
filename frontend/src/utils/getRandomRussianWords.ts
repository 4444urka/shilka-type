import wordsFromMessages from "./russian_words/words_from_messages.json";

interface WordFrequency {
  [word: string]: number;
}

/**
 * Получает случайные русские слова с равномерным распределением
 * @param minLength - минимальная длина слова
 * @param maxLength - максимальная длина слова
 * @param totalChars - общее количество символов для генерации
 * @returns массив случайных слов
 */
export const getRandomRussianWords = (
  minLength: number = 2,
  maxLength: number = 20,
  totalChars: number = 200
): string[] => {
  const words = wordsFromMessages as WordFrequency;

  // Фильтруем слова по длине и создаем простой массив слов
  const filteredWords = Object.keys(words).filter(
    (word) => word.length >= minLength && word.length <= maxLength
  );

  if (filteredWords.length === 0) {
    return ["слово"]; // fallback
  }

  const result: string[] = [];
  let currentChars = 0;

  while (currentChars < totalChars) {
    // Выбираем случайное слово с равной вероятностью
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    const randomWord = filteredWords[randomIndex];

    // Проверяем, не превысим ли мы лимит символов
    if (currentChars + randomWord.length <= totalChars) {
      result.push(randomWord);
      currentChars += randomWord.length;
    } else {
      // Если превысим, попробуем найти слово подходящей длины
      const remainingChars = totalChars - currentChars;
      const suitableWords = filteredWords.filter(
        (word) => word.length <= remainingChars
      );

      if (suitableWords.length > 0) {
        const randomSuitableWord =
          suitableWords[Math.floor(Math.random() * suitableWords.length)];
        result.push(randomSuitableWord);
        currentChars += randomSuitableWord.length;
      } else {
        break; // Не можем найти подходящее слово
      }
    }
  }

  return result.length > 0 ? result : ["слово"];
};
