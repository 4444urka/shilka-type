export interface ColorScheme {
  name: string;
  displayName: string;
  primaryColor: {
    light: string;
    dark: string;
  };
}

export const colorSchemes: Record<string, ColorScheme> = {
  cyan: {
    name: "cyan",
    displayName: "Голубой",
    primaryColor: {
      light: "cyan.500",
      dark: "cyan.400",
    },
  },
  purple: {
    name: "purple",
    displayName: "Фиолетовый",
    primaryColor: {
      light: "purple.500",
      dark: "purple.400",
    },
  },
  pink: {
    name: "pink",
    displayName: "Розовый",
    primaryColor: {
      light: "pink.500",
      dark: "pink.400",
    },
  },
  orange: {
    name: "orange",
    displayName: "Оранжевый",
    primaryColor: {
      light: "orange.500",
      dark: "orange.400",
    },
  },
  green: {
    name: "green",
    displayName: "Зелёный",
    primaryColor: {
      light: "green.500",
      dark: "green.400",
    },
  },
  blue: {
    name: "blue",
    displayName: "Синий",
    primaryColor: {
      light: "blue.500",
      dark: "blue.400",
    },
  },
  red: {
    name: "red",
    displayName: "Красный",
    primaryColor: {
      light: "red.500",
      dark: "red.400",
    },
  },
  teal: {
    name: "teal",
    displayName: "Бирюзовый",
    primaryColor: {
      light: "teal.500",
      dark: "teal.400",
    },
  },
};

export const defaultColorScheme = "cyan";
