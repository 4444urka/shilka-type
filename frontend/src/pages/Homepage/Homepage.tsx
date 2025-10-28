import { Box } from "@chakra-ui/react";
import React, { useState, useCallback } from "react";
import TypingScreen from "../../components/TypingScreen/TypingScreen";
import VictoryScreen from "../../components/VictoryScreen/VictoryScreen";
import useGetRandomWords from "../../hooks/useGetRandomWords";
import { useTypingSession } from "../../hooks/useTypingSession";
import { useSessionDataSync } from "../../hooks/useSessionDataSync";
import type { TypingSessionNew } from "../../types/TypingTypes";
import { useIsAuthed } from "../../hooks/useIsAuthed";

const Homepage = () => {
  const isAuthed = useIsAuthed();
  const [showResults, setShowResults] = useState(false);
  const [shilkaCoins, setShilkaCoins] = useState({ value: 0 });

  // Состояние настроек
  const [selectedTime, setSelectedTime] = useState(30);
  const [selectedWords, setSelectedWords] = useState(25);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ru">("en");
  const [selectedMode, setSelectedMode] = useState<"words" | "sentences">(
    "words"
  );
  const [selectedTestType, setSelectedTestType] = useState<"time" | "words">(
    "time"
  );

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
    },
    [session.isStarted, resetSession]
  );

  const handleWordsChange = useCallback(
    (words: number) => {
      setSelectedWords(words);
      if (!session.isStarted) {
        resetSession();
        refreshWords();
      }
    },
    [session.isStarted, resetSession, refreshWords]
  );

  const handleLanguageChange = useCallback((language: "en" | "ru") => {
    setSelectedLanguage(language);
  }, []);

  const handleModeChange = useCallback(
    (mode: "words" | "sentences") => {
      setSelectedMode(mode);
      refreshWords();
    },
    [refreshWords]
  );

  const handleTestTypeChange = useCallback(
    (testType: "time" | "words") => {
      setSelectedTestType(testType);
      refreshWords();
      resetSession();
    },
    [refreshWords, resetSession]
  );

  return (
    <Box
      display="flex"
      px="200px"
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
