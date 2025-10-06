import sentencesData from "./russian_sentences/sentences.json";

interface SentencesData {
  sentences: string[];
}

/**
 * Получает случайные русские предложения
 * @param totalChars - общее количество символов для генерации
 * @returns массив случайных предложений
 */
export const getRandomRussianSentences = (
  totalChars: number = 200
): string[] => {
  const data = sentencesData as SentencesData;
  const sentences = data.sentences;

  if (sentences.length === 0) {
    return ["Это тестовое предложение."]; // fallback
  }

  const result: string[] = [];
  let currentChars = 0;

  while (currentChars < totalChars) {
    // Выбираем случайное предложение
    const randomIndex = Math.floor(Math.random() * sentences.length);
    const randomSentence = sentences[randomIndex];

    // Проверяем, не превысим ли мы лимит символов
    if (currentChars + randomSentence.length <= totalChars) {
      result.push(randomSentence);
      currentChars += randomSentence.length;
    } else {
      // Если превысим, попробуем найти предложение подходящей длины
      const remainingChars = totalChars - currentChars;
      const suitableSentences = sentences.filter(
        (sentence) => sentence.length <= remainingChars
      );

      if (suitableSentences.length > 0) {
        const randomSuitableSentence =
          suitableSentences[
            Math.floor(Math.random() * suitableSentences.length)
          ];
        result.push(randomSuitableSentence);
        currentChars += randomSuitableSentence.length;
      } else {
        break; // Не можем найти подходящее предложение
      }
    }
  }

  return result.length > 0 ? result : ["Это тестовое предложение."];
};
