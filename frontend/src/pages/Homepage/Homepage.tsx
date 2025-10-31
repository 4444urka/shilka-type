import { Box } from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { updateUserSettings } from "../../api/auth/authRequests";
import TypingScreen from "../../components/TypingScreen/TypingScreen";
import VictoryScreen from "../../components/VictoryScreen/VictoryScreen";
import useGetRandomWords from "../../hooks/useGetRandomWords";
import { useIsAuthed } from "../../hooks/useIsAuthed";
import { useSessionDataSync } from "../../hooks/useSessionDataSync";
import { useTypingSession } from "../../hooks/useTypingSession";
import { useAppSelector } from "../../store";
import type { TypingSessionNew } from "../../types/TypingTypes";

const Homepage = () => {
  const isAuthed = useIsAuthed();
  const [showResults, setShowResults] = useState(false);
  const [shilkaCoins, setShilkaCoins] = useState({ value: 0 });
  const user = useAppSelector((state) => state.user.user);
  const [selectedTime, setSelectedTime] = useState(30);
  const [selectedWords, setSelectedWords] = useState(25);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ru">("en");
  const [selectedMode, setSelectedMode] = useState<"words" | "sentences">(
    "words"
  );
  const [selectedTestType, setSelectedTestType] = useState<"time" | "words">(
    "time"
  );

  React.useEffect(() => {
    if (!user) return;
    setSelectedTime(user.default_time || 30);
    setSelectedWords(user.default_words || 25);
    setSelectedLanguage((user.default_language as "en" | "ru") || "en");
    setSelectedMode((user.default_mode as "words" | "sentences") || "words");
    setSelectedTestType((user.default_test_type as "time" | "words") || "time");
  }, [user]);

  const { words, refreshWords } = useGetRandomWords(
    2,
    5,
    250,
    selectedLanguage,
    selectedMode
  );

  // Хук для отправки данных на сервер
  const { sendSessionData, resetSyncState } = useSessionDataSync({
    enabled: isAuthed,
    mode: selectedMode,
    language: selectedLanguage,
    testType: selectedTestType,
  });

  const handleTypingComplete = useCallback(
    async (session: TypingSessionNew) => {
      await sendSessionData(session);
      setShowResults(true);
    },
    [sendSessionData]
  );

  const handleTimeUp = useCallback(
    async (session: TypingSessionNew) => {
      await sendSessionData(session);
      setShowResults(true);
    },
    [sendSessionData]
  );

  const { session, timeLeft, handleKeyPress, resetSession } = useTypingSession({
    words,
    initialTime: selectedTime,
    onComplete: handleTypingComplete,
    onTimeUp: handleTimeUp,
    testType: selectedTestType,
    wordsCount: selectedWords,
  });

  React.useEffect(() => {
    if (session.isCompleted) {
      const earnedCoins =
        session.stats.correctChars - session.stats.incorrectChars;
      setShilkaCoins({ value: earnedCoins });
    }
  }, [session]);

  const handleRestart = useCallback(() => {
    setShowResults(false);
    resetSyncState(); // Сбрасываем состояние отправки данных
    refreshWords(); // Генерируем новые слова
    resetSession();
  }, [resetSession, resetSyncState, refreshWords]);

  // Обработчики настроек
  const handleTimeChange = useCallback(
    (time: number) => {
      setSelectedTime(time);
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
    [session.isStarted, resetSession, isAuthed]
  );

  const handleWordsChange = useCallback(
    (words: number) => {
      setSelectedWords(words);
      if (!session.isStarted) {
        resetSession();
        refreshWords();
      }
      if (isAuthed) {
        void updateUserSettings({ default_words: words }).catch((err) =>
          console.error("Failed to save settings:", err)
        );
      }
    },
    [session.isStarted, resetSession, refreshWords, isAuthed]
  );

  const handleLanguageChange = useCallback(
    (language: "en" | "ru") => {
      setSelectedLanguage(language);
      if (isAuthed) {
        void updateUserSettings({ default_language: language }).catch((err) =>
          console.error("Failed to save settings:", err)
        );
      }
    },
    [isAuthed]
  );

  const handleModeChange = useCallback(
    (mode: "words" | "sentences") => {
      setSelectedMode(mode);
      refreshWords();
      if (isAuthed) {
        void updateUserSettings({ default_mode: mode }).catch((err) =>
          console.error("Failed to save settings:", err)
        );
      }
    },
    [refreshWords, isAuthed]
  );

  const handleTestTypeChange = useCallback(
    (testType: "time" | "words") => {
      setSelectedTestType(testType);
      refreshWords();
      resetSession();
      if (isAuthed) {
        void updateUserSettings({ default_test_type: testType }).catch((err) =>
          console.error("Failed to save settings:", err)
        );
      }
    },
    [refreshWords, resetSession, isAuthed]
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
      {!showResults ? (
        <TypingScreen
          session={session}
          timeLeft={timeLeft}
          isLoading={words.length === 0}
          onKeyPress={handleKeyPress}
          onRestart={handleRestart}
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
      ) : (
        <VictoryScreen
          session={session}
          shilkaCoins={shilkaCoins}
          testType={selectedTestType}
        />
      )}
    </Box>
  );
};

export default Homepage;
