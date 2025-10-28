import { Button, Menu, Portal, type MenuRootProps } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import React, { useState, useEffect } from "react";
import { colorSchemes, defaultColorScheme } from "../../theme/colorSchemes";

export interface ThemeSelectorMenuProps extends MenuRootProps {
  children: React.ReactNode;
}

const ThemeSelectorMenu: React.FC<ThemeSelectorMenuProps> = ({
  children,
  ...rest
}) => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedColor, setSelectedColor] =
    useState<string>(defaultColorScheme);

  const applyColorScheme = React.useCallback(
    (colorName: string) => {
      const scheme = colorSchemes[colorName];
      if (!scheme) return;

      const root = document.documentElement;
      const currentTheme = theme === "system" ? systemTheme : theme;
      const isDark = currentTheme === "dark";

      // Применяем CSS переменные для primaryColor
      const colorValue = isDark
        ? scheme.primaryColor.dark
        : scheme.primaryColor.light;
      root.style.setProperty(
        "--chakra-colors-primary-color",
        `var(--chakra-colors-${colorValue.replace(".", "-")})`
      );
    },
    [theme, systemTheme]
  );

  // Избегаем гидратации несоответствия
  useEffect(() => {
    setMounted(true);
    // Загружаем сохранённую цветовую схему
    const savedColor =
      localStorage.getItem("colorScheme") || defaultColorScheme;
    setSelectedColor(savedColor);
    applyColorScheme(savedColor);
  }, [applyColorScheme]);

  // Переприменяем цветовую схему при смене темы
  useEffect(() => {
    if (mounted) {
      applyColorScheme(selectedColor);
    }
  }, [theme, systemTheme, mounted, selectedColor, applyColorScheme]);

  if (!mounted) {
    return null;
  }

  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
    localStorage.setItem("colorScheme", colorName);
    applyColorScheme(colorName);
  };

  return (
    <Menu.Root {...rest}>
      <Menu.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          textStyle="input"
          fontSize="sm"
          _hover={{ opacity: 1, color: "primaryColor" }}
          opacity={0.5}
          transition="all 0.2s"
        >
          {children}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content fontSize="sm" textStyle="input" minW="200px">
            {/* Цветовые схемы */}
            <Menu.ItemGroup>
              {Object.entries(colorSchemes).map(([key, scheme]) => {
                const currentTheme = theme === "system" ? systemTheme : theme;
                const hoverColor =
                  currentTheme === "dark"
                    ? scheme.primaryColor.light
                    : scheme.primaryColor.dark;

                return (
                  <Menu.Item
                    key={key}
                    value={key}
                    onClick={() => handleColorChange(key)}
                    color={selectedColor === key ? "primaryColor" : undefined}
                    fontWeight={selectedColor === key ? "semibold" : "normal"}
                    transition="all 0.2s"
                    _hover={{
                      color: hoverColor,
                    }}
                  >
                    {scheme.displayName}
                  </Menu.Item>
                );
              })}
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default ThemeSelectorMenu;
