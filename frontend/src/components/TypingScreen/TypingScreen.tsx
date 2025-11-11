import { Box, Input } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { TypingWordComponent } from "../TypingWordComponent/TypingWordComponent";
import { TypingScreenStats } from "../TypingScreenStats/TypingScreenStats";
import RestartButton from "../RestartButton/RestartButton";
import type { TypingSessionNew } from "../../types/TypingTypes";
import LoadingScreen from "../LoadingScreen/LoadingScreen";

interface TypingScreenProps {
  session: TypingSessionNew;
  timeLeft: number;
  isLoading: boolean;
  onKeyPress: (key: string) => void;
  onRestart: () => void;
}

const TypingScreen: React.FC<TypingScreenProps> = ({
  session,
  timeLeft,
  isLoading,
  onKeyPress,
  onRestart,
}) => {
  const pressedKeysRef = React.useRef<Set<string>>(new Set());
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const wordRefs = React.useRef<Array<HTMLElement | null>>([]);

  // Обработка клавиатуры вынесена в родительский компонент
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Игнорируем события, если фокус на интерактивном элементе (input/textarea/button/a)
      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName) {
        const tag = activeElement.tagName.toUpperCase();
        // Проверяем, не является ли активный элемент нашим скрытым инпутом для мобильных
        const isOurInput = activeElement === inputRef.current;

        if (
          tag === "A" ||
          activeElement.getAttribute("role") === "button" ||
          activeElement.getAttribute("tabindex") !== null ||
          (tag === "INPUT" && !isOurInput) || // Игнорируем все инпуты, кроме нашего скрытого
          tag === "TEXTAREA" ||
          (activeElement as HTMLElement).isContentEditable
        ) {
          return;
        }

        // Если фокус на нашем скрытом инпуте, пропускаем window обработчик
        // потому что событие обработается через onChange/onKeyDown инпута
        if (isOurInput) {
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
      // Проверяем, не была ли эта клавиша уже обработана через window keydown
      if (!pressedKeysRef.current.has(ch)) {
        onKeyPress(ch);
      }
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
      const keyToSend = key === " " ? " " : key;
      // Проверяем, не была ли эта клавиша уже обработана через window keydown
      if (!pressedKeysRef.current.has(keyToSend)) {
        onKeyPress(keyToSend);
      }
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={10}
      position="relative"
      onClick={() => inputRef.current?.focus()}
      minH={{ base: "250px", sm: "280px", md: "320px" }} // Гарантируем минимальную высоту
      width="100%"
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
        zIndex={-1} // Убираем под основной контент
        border={0}
        p={0}
        bg="transparent"
        onChange={handleMobileInput}
        onKeyDown={handleMobileKeyDown}
      />

      {/* Статистика появляется только после начала сессии и когда нет загрузки */}
      {session.isStarted && !isLoading ? (
        <TypingScreenStats
          stats={session.stats}
          displayTime={timeLeft}
          isVisible={session.isStarted}
        />
      ) : (
        // Пустой блок-заполнитель для статистики, чтобы сохранить высоту
        <Box height={{ base: "24px", md: "28px" }} />
      )}

      {/* 
        Основной контейнер для слов или экрана загрузки.
        Используем AnimatePresence для создания эффекта кросс-фейда.
      */}
      <Box
        width="100%"
        height={{ base: "200px", sm: "220px", md: "250px" }}
        position="relative"
      >
        <AnimatePresence>
          {isLoading || session.words.length === 0 ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LoadingScreen />
            </motion.div>
          ) : (
            <motion.div
              key="words"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                width: "100%",
                height: "100%",
              }}
            >
              <Box
                ref={scrollContainerRef}
                textStyle="body"
                height="100%"
                display="block"
                overflowY="auto"
                overflowX="visible"
                width="100%"
                textAlign="justify"
                fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
                css={{
                  textAlignLast: "justify",
                  hyphens: "none",
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
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default TypingScreen;
