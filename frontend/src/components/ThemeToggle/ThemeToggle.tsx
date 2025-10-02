import { IconButton } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { FaMoon, FaSun, FaDesktop } from "react-icons/fa";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Избегаем гидратации несоответствия
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "system") {
      return <FaDesktop />;
    }
    // Для system показываем иконку текущей системной темы
    const currentTheme = theme === "system" ? systemTheme : theme;
    return currentTheme === "light" ? <FaMoon /> : <FaSun />;
  };

  return (
    <IconButton
      aria-label="Toggle theme"
      onClick={cycleTheme}
      variant="ghost"
      opacity={0.6}
      size="md"
      _hover={{ color: "primaryColor", opacity: 1 }}
    >
      {getIcon()}
    </IconButton>
  );
};
