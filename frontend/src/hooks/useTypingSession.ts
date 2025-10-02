import React from "react";
import { getRandomLengthWords } from "../services/randomWordsService";
import type { UseTypingSessionOptions } from "../types/UseTypingSessionOptions";
import type { TypingSessionState } from "../types/TypingSessionState";
import type { TypedChar } from "../types/TypedChar";
import { useAppDispatch } from "../store";
import { addPoints, reset } from "../slices/shilkaCoinsSlice";
import { useIsAuthed } from "./useIsAuthed";
import { postWordHistory } from "../api/stats/statsRequests";

const useTypingSession = ({
  charsCount,
  minLength,
  maxLength,
  initialTime,
}: UseTypingSessionOptions): TypingSessionState => {
  const dispatch = useAppDispatch();
  const [words, setWords] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [time, setTime] = React.useState(initialTime);
  const [isStartedTyping, setIsStartedTyping] = React.useState(false);
  const [position, setPosition] = React.useState({
    activeWordIndex: 0,
    currentCharIndex: 0,
  });
  const { activeWordIndex, currentCharIndex } = position;
  const [typedChars, setTypedChars] = React.useState<TypedChar[]>([]);
  const [wordHistory, setWordHistory] = React.useState<TypedChar[][]>([]);
  const isAuthed = useIsAuthed();
  const sentRef = React.useRef(false);

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
    dispatch(reset());
    let isCancelled = false;

    setIsLoading(true);
    getRandomLengthWords(charsCount, minLength, maxLength)
      .then((nextWords) => {
        if (isCancelled) return;
        setWords(nextWords);
        setWordHistory(Array.from({ length: nextWords.length }, () => []));
        setTypedChars([]);
        setPosition({ activeWordIndex: 0, currentCharIndex: 0 });
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [charsCount, minLength, maxLength, dispatch]);

  // обработчик клавиатуры
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (time <= 0) return;
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
          setPosition((prev) => ({
            activeWordIndex: prev.activeWordIndex + 1,
            currentCharIndex: 0,
          }));
        }
        return;
      }

      if (key === "Backspace") {
        if (currentCharIndex > 0) {
          setTypedChars((prev) => prev.slice(0, -1));
          setPosition((prev) => ({
            ...prev,
            currentCharIndex: prev.currentCharIndex - 1,
          }));
        }
        return;
      }

      if (key.length !== 1) return;

      if (currentCharIndex >= currentWord.length) return;

      const expected = currentWord[currentCharIndex];
      const entered = key;
      const correct = entered.toLowerCase() === expected.toLowerCase();

      setTypedChars((prev) => [...prev, { char: entered, correct, time }]);
      setPosition((prev) => ({
        ...prev,
        currentCharIndex: prev.currentCharIndex + 1,
      }));

      if (correct) {
        dispatch(addPoints(1));
      } else {
        dispatch(addPoints(-1));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [words, activeWordIndex, currentCharIndex, typedChars, dispatch, time]);

  // отправка истории по завершении сессии (time === 0)
  React.useEffect(() => {
    if (time > 0) return;
    if (sentRef.current) return;
    if (!isAuthed) return;
    if (!words.length) return;

    // финализируем историю: добавим текущие набранные символы активного слова
    const finalized: TypedChar[][] = wordHistory.map((w) => [...w]);
    if (typedChars.length > 0 && activeWordIndex < finalized.length) {
      finalized[activeWordIndex] = typedChars.slice();
    }
    const duration = typeof initialTime === "number" ? initialTime : undefined;
    (async () => {
      try {
        await postWordHistory({ words, history: finalized, duration });
        sentRef.current = true;
      } catch {
        // ignore errors for now
      }
    })();
  }, [
    time,
    isAuthed,
    words,
    wordHistory,
    typedChars,
    activeWordIndex,
    initialTime,
  ]);

  const restart = React.useCallback(() => {
    dispatch(reset());
    sentRef.current = false;
    setTime(initialTime);
    setIsStartedTyping(false);
    setPosition({ activeWordIndex: 0, currentCharIndex: 0 });
    setTypedChars([]);
    setWordHistory(Array.from({ length: words.length }, () => []));

    // Загружаем новые слова
    setIsLoading(true);
    getRandomLengthWords(charsCount, minLength, maxLength)
      .then((nextWords) => {
        setWords(nextWords);
        setWordHistory(Array.from({ length: nextWords.length }, () => []));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [charsCount, minLength, maxLength, initialTime, words.length, dispatch]);

  return {
    words,
    isLoading,
    time,
    isStartedTyping,
    activeWordIndex,
    currentCharIndex,
    typedChars,
    wordHistory,
    restart,
  };
};

export default useTypingSession;
