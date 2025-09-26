import React from "react";
import { getRandomLengthWords } from "../services/randomWordsService";

type UseTypingSessionOptions = {
  wordsCount: number;
  initialTime: number;
};

export type TypedChar = {
  char: string;
  correct: boolean;
};

export type TypingSessionState = {
  words: string[];
  isLoading: boolean;
  time: number;
  isStartedTyping: boolean;
  activeWordIndex: number;
  currentCharIndex: number;
  typedChars: TypedChar[];
  wordHistory: TypedChar[][];
};

const useTypingSession = ({
  wordsCount,
  initialTime,
}: UseTypingSessionOptions): TypingSessionState => {
  const [words, setWords] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [time, setTime] = React.useState(initialTime);
  const [isStartedTyping, setIsStartedTyping] = React.useState(false);
  const [activeWordIndex, setActiveWordIndex] = React.useState(0);
  const [currentCharIndex, setCurrentCharIndex] = React.useState(0);
  const [typedChars, setTypedChars] = React.useState<TypedChar[]>([]);
  const [wordHistory, setWordHistory] = React.useState<TypedChar[][]>([]);

  // таймер
  React.useEffect(() => {
    if (isStartedTyping && time > 0) {
      const timer = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isStartedTyping, time]);

  // загрузка слов
  React.useEffect(() => {
    let isCancelled = false;

    setIsLoading(true);
    getRandomLengthWords(wordsCount)
      .then((nextWords) => {
        if (isCancelled) return;
        setWords(nextWords);
        setWordHistory(Array.from({ length: nextWords.length }, () => []));
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [wordsCount]);

  // сброс активного слова при смене
  React.useEffect(() => {
    setTypedChars([]);
    setCurrentCharIndex(0);
  }, [activeWordIndex]);

  // обработчик клавиатуры
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      setIsStartedTyping((prev) => prev || key.length === 1 || key === " ");

      const currentWord = words[activeWordIndex];
      if (!currentWord) return;

      if (key === " ") {
        if (currentCharIndex === currentWord.length) {
          const typedSnapshot = typedChars;
          setWordHistory((prev) => {
            const next = [...prev];
            next[activeWordIndex] = typedSnapshot;
            return next;
          });
          setTypedChars([]);
          setCurrentCharIndex(0);
          setActiveWordIndex((prev) => prev + 1);
        }
        return;
      }

      if (key === "Backspace") {
        if (currentCharIndex > 0) {
          setTypedChars((prev) => prev.slice(0, -1));
          setCurrentCharIndex((prev) => prev - 1);
        }
        return;
      }

      if (key.length !== 1) return;

      if (currentCharIndex >= currentWord.length) return;

      const expected = currentWord[currentCharIndex];
      const entered = key;
      const correct = entered.toLowerCase() === expected.toLowerCase();

      setTypedChars((prev) => [...prev, { char: entered, correct }]);
      setCurrentCharIndex((prev) => prev + 1);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [words, activeWordIndex, currentCharIndex, typedChars]);

  return {
    words,
    isLoading,
    time,
    isStartedTyping,
    activeWordIndex,
    currentCharIndex,
    typedChars,
    wordHistory,
  };
};

export default useTypingSession;
