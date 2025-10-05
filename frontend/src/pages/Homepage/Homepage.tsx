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
  const words = useGetRandomWords(2, 5, 270);
  const [showResults, setShowResults] = useState(false);
  const [shilkaCoins, setShilkaCoins] = useState({ value: 0 });

  // Состояние настроек
  const [selectedTime, setSelectedTime] = useState(30);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Хук для отправки данных на сервер
  const { sendSessionData, resetSyncState } = useSessionDataSync({
    enabled: isAuthed,
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
    resetSession();
  }, [resetSession, resetSyncState]);

  // Обработчики настроек
  const handleTimeChange = useCallback(
    (time: number) => {
      setSelectedTime(time);
      // Если сессия еще не началась, сбрасываем ее при изменении времени
      if (!session.isStarted) {
        resetSession();
      }
    },
    [session.isStarted, resetSession]
  );

  const handleLanguageChange = useCallback((language: string) => {
    setSelectedLanguage(language);
    // Здесь в будущем можно добавить логику смены языка
  }, []);

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
          selectedLanguage={selectedLanguage}
          onTimeChange={handleTimeChange}
          onLanguageChange={handleLanguageChange}
        />
      ) : (
        <VictoryScreen session={session} shilkaCoins={shilkaCoins} />
      )}
    </Box>
  );
};

export default Homepage;
