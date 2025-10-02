import { defineSemanticTokens } from "@chakra-ui/react";

export const semanticTokens = defineSemanticTokens({
  colors: {
    // Primary color - основной акцентный цвет
    primaryColor: {
      value: {
        _light: "{colors.cyan.500}",
        _dark: "{colors.cyan.400}",
      },
    },

    // Background colors - фоны
    bgCardColor: {
      value: {
        _light: "{colors.gray.50}",
        _dark: "{colors.gray.900}",
      },
    },
    bgPage: {
      value: {
        _light: "{colors.white}",
        _dark: "{colors.gray.950}",
      },
    },

    // Text colors - цвета текста
    textColor: {
      value: {
        _light: "{colors.gray.900}",
        _dark: "{colors.gray.100}",
      },
    },
    textPrimary: {
      value: {
        _light: "{colors.gray.900}",
        _dark: "{colors.gray.100}",
      },
    },
    textSecondary: {
      value: {
        _light: "{colors.gray.600}",
        _dark: "{colors.gray.400}",
      },
    },
    textMuted: {
      value: {
        _light: "{colors.gray.500}",
        _dark: "{colors.gray.500}",
      },
    },

    // Border colors - границы
    borderColor: {
      value: {
        _light: "{colors.gray.200}",
        _dark: "{colors.gray.700}",
      },
    },

    // Error/Success colors
    errorColor: {
      value: {
        _light: "{colors.red.600}",
        _dark: "{colors.red.400}",
      },
    },
    successColor: {
      value: {
        _light: "{colors.green.600}",
        _dark: "{colors.green.400}",
      },
    },
  },
});
