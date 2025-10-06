import { Box, Button } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { MdAccessTimeFilled, MdTextFields, MdSubject } from "react-icons/md";

const MotionBox = motion(Box);

type ModeType = "words" | "sentences";

interface SettingsBarProps {
  isVisible: boolean;
  selectedTime: number;
  selectedLanguage: "en" | "ru";
  selectedMode: ModeType;
  onTimeChange: (time: number) => void;
  onLanguageChange: (language: "en" | "ru") => void;
  onModeChange: (mode: ModeType) => void;
}

const SettingsBar: React.FC<SettingsBarProps> = ({
  isVisible,
  selectedTime,
  selectedLanguage,
  selectedMode,
  onTimeChange,
  onLanguageChange,
  onModeChange,
}) => {
  const timeOptions = [15, 30, 60, 120];
  const languageOptions = [
    { code: "en" as const, name: "English" },
    { code: "ru" as const, name: "Русский" },
  ];
  const modeOptions = [
    { code: "words" as const, name: "Слова", icon: MdTextFields },
    { code: "sentences" as const, name: "Предложения", icon: MdSubject },
  ];

  const handleTimeChange = (time: number) => {
    onTimeChange(time);
    // Убираем фокус с кнопки после клика
    (document.activeElement as HTMLElement)?.blur();
  };

  const handleLanguageChange = (language: "en" | "ru") => {
    onLanguageChange(language);
    // Убираем фокус с кнопки после клика
    (document.activeElement as HTMLElement)?.blur();
  };

  const handleModeChange = (mode: ModeType) => {
    onModeChange(mode);
    // Убираем фокус с кнопки после клика
    (document.activeElement as HTMLElement)?.blur();
  };

  if (!isVisible) return null;

  return (
    <MotionBox
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      bg="bgCardColor"
      exit={{ opacity: 0, y: -20 }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={8}
      mb={4}
      py={2}
      px={4}
      borderRadius="lg"
      backdropFilter="blur(16px)"
      textStyle="input"
    >
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        color="primaryColor"
        fontSize="sm"
        fontWeight="medium"
      >
        <MdAccessTimeFilled />
        Время
      </Box>
      {/* Разделитель */}
      <Box width="1px" height="32px" bg="primaryColor" />

      {/* Настройка времени */}
      <Box display="flex" alignItems="center" gap={3}>
        <Box display="flex" gap={2}>
          {timeOptions.map((time) => (
            <Button
              key={time}
              size="sm"
              variant="ghost"
              color={selectedTime === time ? "primaryColor" : undefined}
              onClick={() => handleTimeChange(time)}
              onMouseDown={(e) => e.preventDefault()} // Предотвращаем фокус при клике мышью
              minW="60px"
              fontWeight="medium"
              _hover={{
                transform: "scale(1.02)",
                transition: "all 0.2s",
              }}
              _active={{
                transform: "scale(0.95)",
              }}
            >
              {time}с
            </Button>
          ))}
        </Box>
      </Box>

      {/* Разделитель */}
      <Box width="1px" height="32px" bg="primaryColor" />

      {/* Настройка режима */}
      <Box display="flex" alignItems="center" gap={3}>
        <Box display="flex" gap={2}>
          {modeOptions.map((mode) => {
            const IconComponent = mode.icon;
            return (
              <Button
                key={mode.code}
                size="sm"
                variant="ghost"
                color={selectedMode === mode.code ? "primaryColor" : undefined}
                onClick={() => handleModeChange(mode.code)}
                onMouseDown={(e) => e.preventDefault()}
                minW="120px"
                fontWeight="medium"
                display="flex"
                alignItems="center"
                gap={2}
                _hover={{
                  transform: "scale(1.02)",
                  transition: "all 0.2s",
                }}
                _active={{
                  transform: "scale(0.95)",
                }}
              >
                <IconComponent />
                {mode.name}
              </Button>
            );
          })}
        </Box>
      </Box>

      {/* Разделитель */}
      <Box width="1px" height="32px" bg="primaryColor" />

      {/* Настройка языка */}
      <Box display="flex" alignItems="center" gap={3}>
        <Box display="flex" gap={2}>
          {languageOptions.map((language) => (
            <Button
              key={language.code}
              size="sm"
              variant="ghost"
              color={
                selectedLanguage === language.code ? "primaryColor" : undefined
              }
              onClick={() => handleLanguageChange(language.code)}
              onMouseDown={(e) => e.preventDefault()}
              minW="80px"
              fontWeight="medium"
              _hover={{
                transform: "scale(1.02)",
                transition: "all 0.2s",
              }}
              _active={{
                transform: "scale(0.95)",
              }}
            >
              {language.name}
            </Button>
          ))}
        </Box>
      </Box>
    </MotionBox>
  );
};

export default SettingsBar;
