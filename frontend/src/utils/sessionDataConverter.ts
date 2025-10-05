import type { TypingSessionNew } from "../types/TypingTypes";
import type { WordHistoryPayload } from "../types/WordHistoryPayload";

/**
 * Конвертирует данные сессии печати в формат API для отправки на сервер
 */
export const convertSessionToPayload = (
  session: TypingSessionNew,
  duration: number
): WordHistoryPayload => {
  // Извлекаем оригинальные слова
  const words = session.words.map((word) => word.text);

  // Конвертируем историю печати в формат API
  const history = session.words.map((word) => {
    return word.chars.map((char, index) => ({
      char: char.char,
      correct: char.typed ? char.correct : true, // Если символ не был напечатан, считаем правильным
      time: session.startTime
        ? session.startTime + index * 50 // Примерное время печати каждого символа
        : Date.now(),
    }));
  });

  return {
    words,
    history,
    duration,
    wpm: session.stats.wpm, // Передаем WPM с фронтенда
    accuracy: session.stats.accuracy, // Передаем accuracy с фронтенда
  };
};
