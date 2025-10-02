import { defineSemanticTokens } from "@chakra-ui/react";

export const semanticTokens = defineSemanticTokens({
  colors: {
    primaryColor: { value: "{colors.cyan.500}" },
    bgCardColor: { value: "{colors.gray.50}" },
  },
});
