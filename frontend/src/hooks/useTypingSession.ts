import { useCallback, useEffect, useState, useRef } from "react";
import type {
  TypingSessionNew,
  TypingWord,
  TypingStats,
  CursorPosition,
} from "../types/TypingTypes";

interface UseTypingSessionProps {
  words: string[];
  initialTime: number;
  testType: "time" | "words";
  wordsCount: number;
  onComplete?: (session: TypingSessionNew) => void;
  onTimeUp?: (session: TypingSessionNew) => void;
  onNeedMoreWords?: () => void;
  settingsKey?: string; // Ключ для отслеживания изменения настроек
}

export const useTypingSession = ({
  words,
  initialTime,
  testType,
  wordsCount,
  onComplete,
  onTimeUp,
  onNeedMoreWords,
  settingsKey,
}: UseTypingSessionProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [elapsedTime, setElapsedTime] = useState(0);

  const initializeSession = useCallback(
    (wordsArray: string[]): TypingSessionNew => {
      const wordsToUse =
        testType == "words" ? wordsArray.slice(0, wordsCount) : wordsArray;

      const typingWords: TypingWord[] = wordsToUse.map((word, index) => ({
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
    [initialTime, wordsCount, testType]
  );

  const addMoreWords = useCallback((newWords: string[]) => {
    setSession((prevSession) => {
      const newTypingWords: TypingWord[] = newWords.map((word) => ({
        text: word,
        chars: word.split("").map((char) => ({
          char,
          correct: false,
          typed: false,
        })),
        completed: false,
        active: false,
      }));

      return {
        ...prevSession,
        words: [...prevSession.words, ...newTypingWords],
      };
    });
  }, []);

  const [session, setSession] = useState<TypingSessionNew>(() =>
    initializeSession(words)
  );
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
    wordIndex: 0,
    charIndex: 0,
    x: 0,
    y: 0,
  });

  // Используем ref для отслеживания isCompleted, чтобы не пересоздавать handleKeyPress
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

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
      const timeElapsed =
        testType === "time"
          ? (initialTime - timeLeft) * 1000
          : (currentSession.endTime || Date.now()) -
            (currentSession.startTime || Date.now());

      const minutes = timeElapsed / 1000 / 60;
      if (minutes > 0) {
        wpm = Math.round(correctChars / 5 / minutes);
      }

      return {
        wpm,
        accuracy,
        correctChars,
        incorrectChars,
        totalChars,
      };
    },
    [timeLeft, initialTime, testType]
  );

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

  const handleKeyPress = useCallback(
    (key: string) => {
      // Используем ref вместо прямой зависимости от session
      if (sessionRef.current.isCompleted) return;

      setSession((prevSession) => {
        const newSession = { ...prevSession };

        if (!newSession.isStarted) {
          newSession.isStarted = true;
          newSession.startTime = Date.now();
        }

        const currentWord = newSession.words[newSession.currentWordIndex];
        const currentChar = currentWord.chars[newSession.currentCharIndex];

        if (key === "Backspace") {
          if (newSession.currentCharIndex > 0) {
            const prevCharIndex = newSession.currentCharIndex - 1;
            currentWord.chars[prevCharIndex].typed = false;
            currentWord.chars[prevCharIndex].correct = false;
            newSession.currentCharIndex = prevCharIndex;
          } else if (newSession.currentWordIndex > 0) {
            const prevWordIndex = newSession.currentWordIndex - 1;
            newSession.words[newSession.currentWordIndex].active = false;
            newSession.currentWordIndex = prevWordIndex;
            newSession.currentCharIndex =
              newSession.words[prevWordIndex].chars.length;
            newSession.words[prevWordIndex].active = true;
            newSession.words[prevWordIndex].completed = false;
          }
          updateCursorPosition(
            newSession.currentWordIndex,
            newSession.currentCharIndex
          );
        } else if (key === " ") {
          if (
            newSession.currentCharIndex > 0 &&
            newSession.currentWordIndex < newSession.words.length - 1
          ) {
            currentWord.completed = true;
            currentWord.active = false;
            newSession.currentWordIndex++;
            newSession.currentCharIndex = 0;
            newSession.words[newSession.currentWordIndex].active = true;
            updateCursorPosition(
              newSession.currentWordIndex,
              newSession.currentCharIndex
            );

            // Проверяем, нужно ли подгрузить новые слова (для режима "time")
            // Загружаем, когда осталось меньше 2 слов
            if (
              testType === "time" &&
              onNeedMoreWords &&
              newSession.words.length - newSession.currentWordIndex <= 2
            ) {
              onNeedMoreWords();
            }
          }
        } else if (key.length === 1) {
          if (currentChar) {
            currentChar.typed = true;
            currentChar.correct = currentChar.char === key;
            newSession.currentCharIndex++;
            updateCursorPosition(
              newSession.currentWordIndex,
              newSession.currentCharIndex
            );

            if (newSession.currentCharIndex === currentWord.chars.length) {
              currentWord.completed = true;
              if (newSession.currentWordIndex === newSession.words.length - 1) {
                // В режиме "words" завершаем сессию
                if (testType === "words") {
                  newSession.isCompleted = true;
                  newSession.endTime = Date.now();
                  currentWord.active = false;
                } else {
                  // В режиме "time" подгружаем новые слова
                  if (onNeedMoreWords) {
                    onNeedMoreWords();
                  }
                }
              }
            }
          }
        }

        newSession.stats = calculateStats(newSession);
        return newSession;
      });
    },
    [updateCursorPosition, calculateStats, testType, onNeedMoreWords]
  );

  // Флаг для отслеживания инициализации сессии
  const isInitializedRef = useRef(false);

  const resetSession = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setSession(initializeSession(words));
    setCursorPosition({ wordIndex: 0, charIndex: 0, x: 0, y: 0 });
    setTimeLeft(initialTime);
    setElapsedTime(0);
    isInitializedRef.current = true;
  }, [initializeSession, words, initialTime]);

  useEffect(() => {
    if (session.isStarted && !session.isCompleted) {
      intervalRef.current = setInterval(() => {
        if (testType === "time") {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setSession((s) => ({
                ...s,
                isCompleted: true,
                endTime: Date.now(),
              }));
              return 0;
            }
            return prev - 1;
          });
        } else {
          setElapsedTime((prev) => prev + 1);
        }
      }, 1000);
    } else if (session.isCompleted) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session.isStarted, session.isCompleted, testType]);

  useEffect(() => {
    if (session.isCompleted) {
      const isTimeUpCondition =
        testType === "time" && timeLeft === 0 && session.isStarted;
      const callback = isTimeUpCondition ? onTimeUp : onComplete;
      if (callback) {
        callback(session);
      }
    }
  }, [
    session,
    timeLeft,
    testType,
    onTimeUp,
    onComplete,
    session.isCompleted,
    session.isStarted,
  ]);

  // Отслеживаем изменения настроек и слов
  const prevSettingsKeyRef = useRef(settingsKey);
  const prevWordsSignatureRef = useRef<string | null>(
    words.length > 0 ? words.join("\u0001") : null
  );
  const waitingForWordsRef = useRef(false);
  const resetTimeoutRef = useRef<number | null>(null);

  // Инициализируем сессию только при первой загрузке слов или изменении настроек
  useEffect(() => {
    const currentSignature = words.length > 0 ? words.join("\u0001") : null;

    const settingsChanged = settingsKey !== prevSettingsKeyRef.current;
    const wordsChanged = currentSignature !== prevWordsSignatureRef.current;

    if (settingsChanged) {
      prevSettingsKeyRef.current = settingsKey;

      if (!wordsChanged) {
        waitingForWordsRef.current = true;

        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
        }
        resetTimeoutRef.current = window.setTimeout(() => {
          if (waitingForWordsRef.current) {
            waitingForWordsRef.current = false;
            resetSession();
            isInitializedRef.current = true;
            prevWordsSignatureRef.current = currentSignature;
          }
        }, 100);
      } else if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
    }

    const shouldReset =
      (!isInitializedRef.current && words.length > 0) ||
      (waitingForWordsRef.current && wordsChanged);

    if (shouldReset) {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }

      resetSession();
      isInitializedRef.current = true;
      prevWordsSignatureRef.current = currentSignature;
      waitingForWordsRef.current = false;
    } else if (wordsChanged && !waitingForWordsRef.current) {
      prevWordsSignatureRef.current = currentSignature;
    }

    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [words, resetSession, settingsKey]);

  return {
    session,
    cursorPosition,
    timeLeft: testType === "time" ? timeLeft : elapsedTime,
    handleKeyPress,
    resetSession,
    addMoreWords,
  };
};
