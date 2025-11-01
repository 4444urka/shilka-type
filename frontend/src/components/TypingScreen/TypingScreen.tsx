import { Box, Input } from "@chakra-ui/react";
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
  selectedWords: number;
  selectedLanguage: "en" | "ru";
  selectedMode: "words" | "sentences";
  selectedTestType: "time" | "words";
  onTimeChange: (time: number) => void;
  onWordsChange: (words: number) => void;
  onLanguageChange: (language: "en" | "ru") => void;
  onModeChange: (mode: "words" | "sentences") => void;
  onTestTypeChange: (testType: "time" | "words") => void;
}

const TypingScreen: React.FC<TypingScreenProps> = ({
  session,
  timeLeft,
  isLoading,
  onKeyPress,
  onRestart,
  selectedTime,
  selectedWords,
  selectedLanguage,
  selectedMode,
  selectedTestType,
  onTimeChange,
  onWordsChange,
  onLanguageChange,
  onModeChange,
  onTestTypeChange,
}) => {
  const pressedKeysRef = React.useRef<Set<string>>(new Set());
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const wordRefs = React.useRef<Array<HTMLElement | null>>([]);

  // Обработка клавиатуры вынесена в родительский компонент
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Игнорируем глобальные события, если фокус на интерактивных элементах
      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement) {
        const tag = activeElement.tagName;
        if (
          tag === "BUTTON" ||
          activeElement.getAttribute("role") === "button" ||
          activeElement.getAttribute("tabindex") !== null ||
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          activeElement.isContentEditable
        ) {
          return;
        }
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

  // Фокусируем скрытое input при старте сессии, чтобы вызвать экранную клавиатуру на мобильных
  React.useEffect(() => {
    if (inputRef.current && session.isStarted) {
      try {
        inputRef.current.focus();
      } catch {
        // ignore
      }
    }
  }, [session.isStarted]);

  // Автоскролл к текущему слову: прокручиваем контейнер, чтобы текущее слово было видно
  React.useEffect(() => {
    const idx = session.currentWordIndex;
    const container = scrollContainerRef.current;
    const target = wordRefs.current[idx];
    if (container && target) {
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const targetTop = target.offsetTop;
      const targetBottom = targetTop + target.clientHeight;

      if (targetTop < containerTop || targetBottom > containerBottom) {
        // Прокручиваем так, чтобы элемент оказался в центре контейнера
        const scrollTo =
          targetTop - container.clientHeight / 2 + target.clientHeight / 2;
        container.scrollTo({ top: scrollTo, behavior: "smooth" });
      }
    }
  }, [session.currentWordIndex, session.words.length]);

  const handleMobileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    // отправляем каждый символ отдельно
    for (const ch of val) {
      onKeyPress(ch);
    }
    // очистим поле, чтобы следующий ввод был читаемым
    e.target.value = "";
  };

  const handleMobileKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    // Обработаем Backspace и служебные клавиши
    if (
      key === "Backspace" ||
      key === "Enter" ||
      key === "Tab" ||
      key === " " ||
      key.startsWith("Arrow")
    ) {
      e.preventDefault();
      onKeyPress(key === " " ? " " : key);
    }
  };

  if (isLoading || session.words.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={10}
      position="relative"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Скрытое поле для вызова экранной клавиатуры на мобильных */}
      <Input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        aria-label="typing-input"
        position="absolute"
        top={2}
        right={2}
        w="1px"
        h="1px"
        opacity={0}
        zIndex={0}
        border={0}
        p={0}
        bg="transparent"
        onChange={handleMobileInput}
        onKeyDown={handleMobileKeyDown}
      />
      {session.isStarted ? (
        <TypingScreenStats
          stats={session.stats}
          displayTime={timeLeft}
          isVisible={session.isStarted}
        />
      ) : (
        <SettingsBar
          hideBelow="md"
          isVisible={!session.isStarted}
          selectedTime={selectedTime}
          selectedWords={selectedWords}
          selectedLanguage={selectedLanguage}
          selectedMode={selectedMode}
          selectedTestType={selectedTestType}
          onTimeChange={onTimeChange}
          onWordsChange={onWordsChange}
          onLanguageChange={onLanguageChange}
          onModeChange={onModeChange}
          onTestTypeChange={onTestTypeChange}
        />
      )}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={6}
        maxW="100%"
      >
        {!isLoading && session.words.length > 0 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={10}
            key={session.words.map((w) => w.text).join("-")}
          >
            <Box
              ref={scrollContainerRef}
              textStyle="body"
              height="200px"
              display="block"
              overflowY="auto"
              width="100%"
              textAlign="justify"
              position="relative"
              css={{
                textAlignLast: "justify",
                hyphens: "none",
                // allow normal wrapping and inline flow
                whiteSpace: "normal",
              }}
            >
              {session.words.map((word, wordIndex) => (
                <Box
                  as="span"
                  key={`word-wrapper-${wordIndex}`}
                  ref={(el: HTMLElement | null) =>
                    (wordRefs.current[wordIndex] = el)
                  }
                  display="inline-block"
                  mr={2}
                >
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
                </Box>
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
