import { useCallback, useEffect, useState, useRef } from "react";
import type {
  TypingSessionNew,
  TypingWord,
  TypingStats,
  CursorPosition,
} from "../types/TypingTypes";

interface UseTypingSessionProps {
  words: string[];
  initialTime: number; // время в секундах
  onComplete?: (session: TypingSessionNew) => void;
  onTimeUp?: (session: TypingSessionNew) => void;
}

export const useTypingSession = ({
  words,
  initialTime,
  onComplete,
  onTimeUp,
}: UseTypingSessionProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // Инициализация сессии
  const initializeSession = useCallback(
    (wordsArray: string[]): TypingSessionNew => {
      const typingWords: TypingWord[] = wordsArray.map((word, index) => ({
        text: word,
        chars: word.split("").map((char) => ({
          char,
          correct: false,
          typed: false,
        })),
        completed: false,
        active: index === 0,
      }));

      return {
        words: typingWords,
        currentWordIndex: 0,
        currentCharIndex: 0,
        initialTime,
        startTime: null,
        endTime: null,
        isStarted: false,
        isCompleted: false,
        stats: {
          wpm: 0,
          accuracy: 0,
          correctChars: 0,
          incorrectChars: 0,
          totalChars: 0,
        },
      };
    },
    [initialTime]
  );

  const [session, setSession] = useState<TypingSessionNew>(() =>
    initializeSession(words)
  );
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
    wordIndex: 0,
    charIndex: 0,
    x: 0,
    y: 0,
  });

  // Вычисление статистики
  const calculateStats = useCallback(
    (currentSession: TypingSessionNew): TypingStats => {
      const allChars = currentSession.words.flatMap((word) => word.chars);
      const typedChars = allChars.filter((char) => char.typed);
      const correctChars = typedChars.filter((char) => char.correct).length;
      const incorrectChars = typedChars.filter((char) => !char.correct).length;
      const totalChars = typedChars.length;

      const accuracy =
        totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

      let wpm = 0;
      if (currentSession.startTime) {
        const timeElapsed = initialTime - timeLeft;
        const minutes = timeElapsed / 60;
        wpm = minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0;
      }

      return {
        wpm,
        accuracy,
        correctChars,
        incorrectChars,
        totalChars,
      };
    },
    [timeLeft, initialTime]
  );

  // Обновление позиции курсора
  const updateCursorPosition = useCallback(
    (wordIndex: number, charIndex: number) => {
      setCursorPosition((prev) => ({
        ...prev,
        wordIndex,
        charIndex,
      }));
    },
    []
  );

  // Обработка ввода символа
  const handleKeyPress = useCallback(
    (key: string) => {
      if (session.isCompleted) return;

      setSession((prevSession) => {
        const newSession = { ...prevSession };

        // Запуск таймера при первом нажатии
        if (!newSession.isStarted) {
          newSession.isStarted = true;
          newSession.startTime = Date.now();
        }

        const currentWord = newSession.words[newSession.currentWordIndex];
        const currentChar = currentWord.chars[newSession.currentCharIndex];

        if (key === "Backspace") {
          // Обработка удаления
          if (newSession.currentCharIndex > 0) {
            const prevCharIndex = newSession.currentCharIndex - 1;
            const prevChar = currentWord.chars[prevCharIndex];

            prevChar.typed = false;
            prevChar.correct = false;
            newSession.currentCharIndex = prevCharIndex;

            updateCursorPosition(
              newSession.currentWordIndex,
              newSession.currentCharIndex
            );
          } else if (newSession.currentWordIndex > 0) {
            // Переход к предыдущему слову
            const prevWordIndex = newSession.currentWordIndex - 1;
            const prevWord = newSession.words[prevWordIndex];

            newSession.words[newSession.currentWordIndex].active = false;
            newSession.currentWordIndex = prevWordIndex;
            newSession.currentCharIndex = prevWord.chars.length;
            newSession.words[prevWordIndex].active = true;
            newSession.words[prevWordIndex].completed = false;

            updateCursorPosition(
              newSession.currentWordIndex,
              newSession.currentCharIndex
            );
          }
        } else if (key === " ") {
          // Переход к следующему слову
          if (newSession.currentWordIndex < newSession.words.length - 1) {
            currentWord.completed = true;
            currentWord.active = false;

            newSession.currentWordIndex++;
            newSession.currentCharIndex = 0;
            newSession.words[newSession.currentWordIndex].active = true;

            updateCursorPosition(
              newSession.currentWordIndex,
              newSession.currentCharIndex
            );
          }
        } else if (key.length === 1) {
          // Обработка обычного символа
          if (currentChar) {
            currentChar.typed = true;
            currentChar.correct = currentChar.char === key;

            newSession.currentCharIndex++;
            updateCursorPosition(
              newSession.currentWordIndex,
              newSession.currentCharIndex
            );

            // Проверка завершения слова
            if (newSession.currentCharIndex === currentWord.chars.length) {
              currentWord.completed = true;

              // Проверка завершения всего текста
              if (newSession.currentWordIndex === newSession.words.length - 1) {
                newSession.isCompleted = true;
                newSession.endTime = Date.now();
                currentWord.active = false;
              }
            }
          }
        }

        // Обновление статистики
        newSession.stats = calculateStats(newSession);

        return newSession;
      });
    },
    [session.isCompleted, updateCursorPosition, calculateStats]
  );

  // Сброс сессии
  const resetSession = useCallback(() => {
    setSession(initializeSession(words));
    setCursorPosition({ wordIndex: 0, charIndex: 0, x: 0, y: 0 });
    setTimeLeft(initialTime);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [initializeSession, words, initialTime]);

  // Таймер на убывание
  useEffect(() => {
    if (session.isStarted && !session.isCompleted && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Время истекло
            setSession((currentSession) => {
              const updatedSession = { ...currentSession };
              updatedSession.isCompleted = true;
              updatedSession.endTime = Date.now();
              if (updatedSession.words[updatedSession.currentWordIndex]) {
                updatedSession.words[updatedSession.currentWordIndex].active =
                  false;
              }
              return updatedSession;
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session.isStarted, session.isCompleted, timeLeft]);

  // Обработка завершения сессии (по времени или по завершению)
  useEffect(() => {
    const isSessionEnded =
      (timeLeft === 0 && session.isStarted) || session.isCompleted;

    if (isSessionEnded) {
      const isTimeUp = timeLeft === 0 && session.isStarted;
      const callback = isTimeUp ? onTimeUp : onComplete;

      if (callback) {
        callback(session);
      }
    }
  }, [
    timeLeft,
    session.isStarted,
    session.isCompleted,
    onTimeUp,
    onComplete,
    session,
  ]);

  // Обновление сессии при изменении слов
  useEffect(() => {
    if (words.length > 0) {
      resetSession();
    }
  }, [words, resetSession]);

  return {
    session,
    cursorPosition,
    timeLeft,
    handleKeyPress,
    resetSession,
  };
};
