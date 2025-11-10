import { Box, type BoxProps } from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  MdAccessTimeFilled,
  MdFunctions,
  MdSubject,
  MdTextFields,
} from "react-icons/md";
import SettingsBarButton from "../SettingsBarButton/SettingsBarButton";
import React from "react";

const MotionBox = motion.create(Box);

type ModeType = "words" | "sentences";
type TestType = "time" | "words";

interface SettingsBarProps extends BoxProps {
  isVisible: boolean;
  selectedTime: number;
  selectedWords: number;
  selectedLanguage: "en" | "ru";
  selectedMode: ModeType;
  selectedTestType: TestType;
  onTimeChange: (time: number) => void;
  onWordsChange: (words: number) => void;
  onLanguageChange: (language: "en" | "ru") => void;
  onModeChange: (mode: ModeType) => void;
  onTestTypeChange: (testType: TestType) => void;
}

const SettingsBar: React.FC<SettingsBarProps> = ({
  isVisible,
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
  ...rest
}) => {
  const timeOptions = [15, 30, 60, 120];
  const wordsOptions = [10, 25, 50, 100];
  const languageOptions = [
    { code: "en" as const, name: "English" },
    { code: "ru" as const, name: "Русский" },
  ];
  const modeOptions = [
    { code: "words" as const, name: "Слова", icon: MdTextFields },
    { code: "sentences" as const, name: "Предложения", icon: MdSubject },
  ];
  const testTypeOptions = [
    { code: "time" as const, name: "Время", icon: MdAccessTimeFilled },
    { code: "words" as const, name: "Слова", icon: MdFunctions },
  ];

  const handleTimeChange = (time: number) => {
    onTimeChange(time);
    (document.activeElement as HTMLElement)?.blur();
  };

  const handleWordsChange = (words: number) => {
    onWordsChange(words);
    (document.activeElement as HTMLElement)?.blur();
  };

  const handleLanguageChange = (language: "en" | "ru") => {
    onLanguageChange(language);
    (document.activeElement as HTMLElement)?.blur();
  };

  const handleModeChange = (mode: ModeType) => {
    onModeChange(mode);
    (document.activeElement as HTMLElement)?.blur();
  };

  const handleTestTypeChange = (testType: TestType) => {
    onTestTypeChange(testType);
    (document.activeElement as HTMLElement)?.blur();
  };

  if (!isVisible) return null;

  return (
    <Box {...rest}>
      <MotionBox
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        bg="bgCardColor"
        exit={{ opacity: 0, y: -20 }}
        display="flex"
        flexDirection={{ base: "column", lg: "row" }}
        alignItems="center"
        justifyContent="center"
        gap={{ base: 3, lg: 8 }}
        mb={4}
        py={{ base: 3, lg: 2 }}
        px={{ base: 3, lg: 4 }}
        borderRadius="lg"
        backdropFilter="blur(16px)"
        textStyle="input"
        maxW="100%"
        overflowX={{ base: "auto", lg: "visible" }}
      >
        {/* Переключатель типа теста */}
        <Box
          display="flex"
          alignItems="center"
          gap={{ base: 2, lg: 3 }}
          flexWrap="wrap"
          justifyContent="center"
        >
          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
            {testTypeOptions.map((testType) => {
              const IconComponent = testType.icon;
              return (
                <SettingsBarButton
                  key={testType.code}
                  color={
                    selectedTestType === testType.code
                      ? "primaryColor"
                      : "textColor"
                  }
                  onClick={() => handleTestTypeChange(testType.code)}
                  onMouseDown={(e) => e.preventDefault()}
                  fontSize={{ base: "sm", md: "lg" }}
                  px={{ base: 2, lg: 3 }}
                  py={{ base: 1, lg: 2 }}
                >
                  <IconComponent />
                  <Box as="span" hideBelow="sm">
                    {testType.name}
                  </Box>
                </SettingsBarButton>
              );
            })}
          </Box>
        </Box>
        <Box
          width={{ base: "100%", lg: "1px" }}
          height={{ base: "1px", lg: "32px" }}
          bg="primaryColor"
          hideBelow="lg"
        />
        {/* Настройка времени или количества слов */}
        {selectedTestType === "time" ? (
          <Box
            display="flex"
            alignItems="center"
            gap={{ base: 2, lg: 3 }}
            flexWrap="wrap"
            justifyContent="center"
          >
            <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
              {timeOptions.map((time) => (
                <SettingsBarButton
                  key={time}
                  color={selectedTime === time ? "primaryColor" : "textColor"}
                  onClick={() => handleTimeChange(time)}
                  fontSize={{ base: "sm", lg: "md" }}
                  px={{ base: 2, lg: 3 }}
                  py={{ base: 1, lg: 2 }}
                >
                  {time}с
                </SettingsBarButton>
              ))}
            </Box>
          </Box>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            gap={{ base: 2, md: 3 }}
            flexWrap="wrap"
            justifyContent="center"
          >
            <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
              {wordsOptions.map((words) => (
                <SettingsBarButton
                  key={words}
                  color={selectedWords === words ? "primaryColor" : "textColor"}
                  onClick={() => handleWordsChange(words)}
                  fontSize={{ base: "sm", lg: "md" }}
                  px={{ base: 2, lg: 3 }}
                  py={{ base: 1, lg: 2 }}
                >
                  {words}
                </SettingsBarButton>
              ))}
            </Box>
          </Box>
        )}
        {/* Разделитель */}
        <Box
          width={{ base: "100%", lg: "1px" }}
          height={{ base: "1px", lg: "32px" }}
          bg="primaryColor"
          hideBelow="md"
        />
        {/* Настройка режима */}
        <Box
          display="flex"
          alignItems="center"
          gap={{ base: 2, lg: 3 }}
          flexWrap="wrap"
          justifyContent="center"
        >
          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
            {modeOptions.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <SettingsBarButton
                  key={mode.code}
                  color={
                    selectedMode === mode.code ? "primaryColor" : "textColor"
                  }
                  onClick={() => handleModeChange(mode.code)}
                  fontSize={{ base: "sm", lg: "md" }}
                  px={{ base: 2, lg: 3 }}
                  py={{ base: 1, lg: 2 }}
                >
                  <IconComponent />
                  <Box as="span" hideBelow="sm">
                    {mode.name}
                  </Box>
                </SettingsBarButton>
              );
            })}
          </Box>
        </Box>
        {/* Разделитель */}
        <Box
          width={{ base: "100%", md: "1px" }}
          height={{ base: "1px", md: "32px" }}
          bg="primaryColor"
          hideBelow="md"
        />
        {/* Настройка языка */}
        <Box
          display="flex"
          alignItems="center"
          gap={{ base: 2, md: 3 }}
          flexWrap="wrap"
          justifyContent="center"
        >
          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
            {languageOptions.map((language) => (
              <SettingsBarButton
                key={language.code}
                color={
                  selectedLanguage === language.code
                    ? "primaryColor"
                    : "textColor"
                }
                onClick={() => handleLanguageChange(language.code)}
                fontSize={{ base: "sm", md: "md" }}
                px={{ base: 2, md: 3 }}
                py={{ base: 1, md: 2 }}
              >
                {language.name}
              </SettingsBarButton>
            ))}
          </Box>
        </Box>
      </MotionBox>
    </Box>
  );
};

// Мемоизируем компонент и сравниваем только по значениям настроек, игнорируя функции
export default React.memo(SettingsBar, (prevProps, nextProps) => {
  // Возвращаем true если пропсы одинаковые (не нужно перерендеривать)
  return (
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.selectedTime === nextProps.selectedTime &&
    prevProps.selectedWords === nextProps.selectedWords &&
    prevProps.selectedLanguage === nextProps.selectedLanguage &&
    prevProps.selectedMode === nextProps.selectedMode &&
    prevProps.selectedTestType === nextProps.selectedTestType
    // Намеренно НЕ сравниваем callback функции - они могут меняться, это нормально
  );
});
