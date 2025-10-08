import { Box } from "@chakra-ui/react";
import React from "react";
import { TypingWordComponent } from "../TypingWordComponent/TypingWordComponent";
import { TypingScreenStats } from "../TypingScreenStats/TypingScreenStats";
import SettingsBar from "../SettingsBar/SettingsBar";
import RestartButton from "../RestartButton/RestartButton";
import type { TypingSessionNew } from "../../types/TypingTypes";
import LoadingScreen from "../LoadingScreen/LoadingScreen";

interface TypingScreenProps {
  session: TypingSessionNew;
  timeLeft: number;
  isLoading: boolean;
  onKeyPress: (key: string) => void;
  onRestart: () => void;
  // Пропсы для настроек
  selectedTime: number;
  selectedLanguage: "en" | "ru";
  selectedMode: "words" | "sentences";
  onTimeChange: (time: number) => void;
  onLanguageChange: (language: "en" | "ru") => void;
  onModeChange: (mode: "words" | "sentences") => void;
}

const TypingScreen: React.FC<TypingScreenProps> = ({
  session,
  timeLeft,
  isLoading,
  onKeyPress,
  onRestart,
  selectedTime,
  selectedLanguage,
  selectedMode,
  onTimeChange,
  onLanguageChange,
  onModeChange,
}) => {
  const pressedKeysRef = React.useRef<Set<string>>(new Set());

  // Обработка клавиатуры вынесена в родительский компонент
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Игнорируем события клавиатуры, если активен фокус на кнопках или других интерактивных элементах
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "BUTTON" ||
          activeElement.getAttribute("role") === "button" ||
          activeElement.getAttribute("tabindex") !== null)
      ) {
        return;
      }

      // Предотвращаем повторные нажатия (зажатие клавиш)
      if (pressedKeysRef.current.has(event.key)) {
        event.preventDefault();
        return;
      }

      // Добавляем клавишу в набор нажатых
      pressedKeysRef.current.add(event.key);

      // Предотвращаем стандартное поведение для некоторых клавиш
      if (
        [
          "Backspace",
          "Enter",
          "Tab",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          " ", // Добавляем пробел
        ].includes(event.key)
      ) {
        event.preventDefault();
      }

      // Игнорируем комбинации с Ctrl/Cmd/Alt
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      onKeyPress(event.key);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Удаляем клавишу из набора нажатых при отпускании
      pressedKeysRef.current.delete(event.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onKeyPress]);

  if (isLoading || session.words.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={10}>
      {session.isStarted ? (
        <TypingScreenStats
          stats={session.stats}
          displayTime={timeLeft}
          isVisible={session.isStarted}
        />
      ) : (
        <SettingsBar
          isVisible={!session.isStarted}
          selectedTime={selectedTime}
          selectedLanguage={selectedLanguage}
          selectedMode={selectedMode}
          onTimeChange={onTimeChange}
          onLanguageChange={onLanguageChange}
          onModeChange={onModeChange}
        />
      )}
      <Box display="flex" flexDirection="column" alignItems="center" gap={6}>
        {!isLoading && session.words.length > 0 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={10}
            animation="fadeIn 0.5s ease-in-out"
            key={session.words.map((w) => w.text).join("-")}
          >
            <Box
              textStyle="body"
              height="200px"
              display="block"
              width="100%"
              textAlign="justify"
              position="relative"
              css={{
                textAlignLast: "justify",
                hyphens: "none",
              }}
            >
              {session.words.map((word, wordIndex) => (
                <TypingWordComponent
                  key={`word-${wordIndex}`}
                  word={word}
                  wordIndex={wordIndex}
                  currentCharIndex={
                    wordIndex === session.currentWordIndex
                      ? session.currentCharIndex
                      : -1
                  }
                  isCurrentWord={wordIndex === session.currentWordIndex}
                />
              ))}
            </Box>
            <RestartButton onClick={onRestart} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TypingScreen;
