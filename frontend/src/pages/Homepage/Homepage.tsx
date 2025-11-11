import { Box } from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { updateUserSettings } from "../../api/auth/authRequests";
import TypingScreen from "../../components/TypingScreen/TypingScreen";
import VictoryScreen from "../../components/VictoryScreen/VictoryScreen";
import SettingsBar from "../../components/SettingsBar/SettingsBar";
import useGetRandomWords from "../../hooks/useGetRandomWords";
import { useIsAuthed } from "../../hooks/useIsAuthed";
import { useAppSelector, useAppDispatch } from "../../store";
import {
  setTime as setTimeAction,
  setWords as setWordsAction,
  setLanguage as setLanguageAction,
  setMode as setModeAction,
  setTestType as setTestTypeAction,
} from "../../slices/settingsSlice";
import { useSessionDataSync } from "../../hooks/useSessionDataSync";
import { useTypingSession } from "../../hooks/useTypingSession";
import type { TypingSessionNew } from "../../types/TypingTypes";

const Homepage = () => {
  const isAuthed = useIsAuthed();
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    wpm: number;
    accuracy: number;
  } | null>(null);
  const [shilkaCoins, setShilkaCoins] = useState({ value: 0 });
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();

  const selectedTime = useAppSelector((s) => s.settings.selectedTime);
  const selectedWords = useAppSelector((s) => s.settings.selectedWords);
  const selectedLanguage = useAppSelector(
    (s) => s.settings.selectedLanguage
  ) as "en" | "ru";
  const selectedMode = useAppSelector((s) => s.settings.selectedMode) as
    | "words"
    | "sentences";
  const selectedTestType = useAppSelector(
    (s) => s.settings.selectedTestType
  ) as "time" | "words";

  React.useEffect(() => {
    if (!user) return;
    // Если в localStorage уже есть сохранённые настройки, не перезаписываем их.
    try {
      const existing = localStorage.getItem("shilka_settings");
      if (!existing) {
        dispatch(setTimeAction(user.default_time || 30));
        dispatch(setWordsAction(user.default_words || 25));
        dispatch(
          setLanguageAction((user.default_language as "en" | "ru") || "en")
        );
        dispatch(
          setModeAction((user.default_mode as "words" | "sentences") || "words")
        );
        dispatch(
          setTestTypeAction(
            (user.default_test_type as "time" | "words") || "time"
          )
        );
      }
    } catch {
      // ignore
    }
  }, [user, dispatch]);

  // Вычисляем количество символов на основе выбранного количества слов
  // Предполагаем среднюю длину слова ~5 символов
  const totalChars = selectedTestType === "words" ? selectedWords * 5 : 80;

  const {
    words,
    refreshWords,
    addMoreWords: addMoreWordsToList,
    isLoading,
    error,
  } = useGetRandomWords(2, 5, totalChars, selectedLanguage, selectedMode);

  const [isLoadingMoreWords, setIsLoadingMoreWords] = useState(false);

  // Хук для отправки данных на сервер
  const { sendSessionData, resetSyncState } = useSessionDataSync({
    enabled: isAuthed,
    mode: selectedMode,
    language: selectedLanguage,
    testType: selectedTestType,
  });

  const handleTypingComplete = useCallback(
    async (session: TypingSessionNew) => {
      const response = await sendSessionData(session);
      if (response) {
        setResults({
          wpm: response.wpm,
          accuracy: response.accuracy,
        });
      }
      setShowResults(true);
    },
    [sendSessionData]
  );

  const handleTimeUp = useCallback(
    async (session: TypingSessionNew) => {
      const response = await sendSessionData(session);
      if (response) {
        setResults({
          wpm: response.wpm,
          accuracy: response.accuracy,
        });
      }
      setShowResults(true);
    },
    [sendSessionData]
  );

  const handleNeedMoreWords = useCallback(() => {
    if (!isLoadingMoreWords && selectedTestType === "time") {
      setIsLoadingMoreWords(true);
      // Загружаем дополнительные слова (80 символов вместо 250)
      void addMoreWordsToList(30).finally(() => {
        setIsLoadingMoreWords(false);
      });
    }
  }, [isLoadingMoreWords, addMoreWordsToList, selectedTestType]);

  // Создаём ключ настроек для отслеживания их изменений
  const settingsKey = `${selectedLanguage}-${selectedMode}-${selectedTestType}-${selectedWords}-${selectedTime}`;

  const { session, timeLeft, handleKeyPress, resetSession, addMoreWords } =
    useTypingSession({
      words,
      initialTime: selectedTime,
      onComplete: handleTypingComplete,
      onTimeUp: handleTimeUp,
      testType: selectedTestType,
      wordsCount: selectedWords,
      onNeedMoreWords: handleNeedMoreWords,
      settingsKey,
    });

  React.useEffect(() => {
    if (session.isCompleted) {
      const earnedCoins =
        session.stats.correctChars - session.stats.incorrectChars;
      setShilkaCoins({ value: earnedCoins });
    }
  }, [session]);

  // Добавляем новые слова в сессию, когда они загружаются
  const prevWordsLengthRef = React.useRef(words.length);
  React.useEffect(() => {
    if (
      session.isStarted &&
      !session.isCompleted &&
      words.length > prevWordsLengthRef.current &&
      selectedTestType === "time"
    ) {
      const newWords = words.slice(prevWordsLengthRef.current);
      if (newWords.length > 0) {
        addMoreWords(newWords);
      }
    }
    prevWordsLengthRef.current = words.length;
  }, [
    words,
    session.isStarted,
    session.isCompleted,
    selectedTestType,
    addMoreWords,
  ]);

  const handleRestart = useCallback(() => {
    setShowResults(false);
    resetSyncState(); // Сбрасываем состояние отправки данных
    refreshWords(); // Генерируем новые слова
    resetSession();
  }, [resetSession, resetSyncState, refreshWords]);

  // Обработчики настроек
  const handleTimeChange = useCallback(
    (time: number) => {
      dispatch(setTimeAction(time));
      if (!session.isStarted) {
        resetSession();
      }
      // Сохраняем настройку на сервере, если пользователь авторизован
      if (isAuthed) {
        void updateUserSettings({ default_time: time }).catch((err) =>
          console.error("Failed to save settings:", err)
        );
      }
    },
    [session.isStarted, resetSession, isAuthed, dispatch]
  );

  const handleWordsChange = useCallback(
    (words: number) => {
      dispatch(setWordsAction(words));
      if (!session.isStarted) {
        resetSession();
      }
      if (isAuthed) {
        void updateUserSettings({ default_words: words }).catch((err) =>
          console.error("Failed to save settings:", err)
        );
      }
    },
    [session.isStarted, resetSession, isAuthed, dispatch]
  );

  const handleLanguageChange = useCallback(
    (language: "en" | "ru") => {
      dispatch(setLanguageAction(language));
      // refreshWords вызывается для сброса сессии при смене языка
      if (!session.isStarted) {
        resetSession();
      }
      if (isAuthed) {
        void updateUserSettings({ default_language: language }).catch((err) =>
          console.error("Failed to save settings:", err)
        );
      }
    },
    [isAuthed, dispatch, session.isStarted, resetSession]
  );

  const handleModeChange = useCallback(
    (mode: "words" | "sentences") => {
      dispatch(setModeAction(mode));
      if (!session.isStarted) {
        resetSession();
      }
      if (isAuthed) {
        void updateUserSettings({ default_mode: mode }).catch((err) =>
          console.error("Failed to save settings:", err)
        );
      }
    },
    [isAuthed, dispatch, session.isStarted, resetSession]
  );

  const handleTestTypeChange = useCallback(
    (testType: "time" | "words") => {
      dispatch(setTestTypeAction(testType));
      if (!session.isStarted) {
        resetSession();
      }
      if (isAuthed) {
        void updateUserSettings({ default_test_type: testType }).catch((err) =>
          console.error("Failed to save settings:", err)
        );
      }
    },
    [resetSession, isAuthed, dispatch, session.isStarted]
  );

  return (
    <Box
      display="flex"
      px={{ base: 4, md: 10, xl: 200 }}
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      minHeight="75vh"
      animation="fadeIn 0.5s ease-in-out"
    >
      {error && (
        <Box color="errorColor" textStyle="body" mb={4}>
          {error}
        </Box>
      )}
      {!showResults ? (
        <>
          {/* SettingsBar теперь в Homepage - не зависит от перерендеров TypingScreen */}
          <SettingsBar
            isVisible={!session.isStarted}
            selectedTime={selectedTime}
            selectedWords={selectedWords}
            selectedLanguage={selectedLanguage}
            selectedMode={selectedMode}
            selectedTestType={selectedTestType}
            onTimeChange={handleTimeChange}
            onWordsChange={handleWordsChange}
            onLanguageChange={handleLanguageChange}
            onModeChange={handleModeChange}
            onTestTypeChange={handleTestTypeChange}
          />
          <TypingScreen
            session={session}
            timeLeft={timeLeft}
            isLoading={isLoading || words.length === 0}
            onKeyPress={handleKeyPress}
            onRestart={handleRestart}
          />
        </>
      ) : (
        <VictoryScreen
          session={session}
          shilkaCoins={shilkaCoins}
          testType={selectedTestType}
          wpm={results?.wpm ?? session.stats.wpm ?? 0}
          accuracy={results?.accuracy ?? session.stats.accuracy ?? 0}
        />
      )}
    </Box>
  );
};

export default Homepage;
