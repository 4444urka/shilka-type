import { defineTextStyles } from "@chakra-ui/react";

export const textStyles = defineTextStyles({
  body: {
    description: "The body text style - used in paragraphs",
    value: {
      fontFamily: "JetBrains Mono",
      fontWeight: "500",
      fontSize: "30px",
      textDecoration: "None",
      textTransform: "None",
    },
  },
  header: {
    description: "The header text style - used in app headers",
    value: {
      fontFamily: "JetBrains Mono",
      fontWeight: "800",
      fontSize: "24px",
    },
  },
  input: {
    description: "The input text style - used in form inputs",
    value: {
      fontFamily: "JetBrains Mono",
      fontWeight: "500",
      fontSize: "16px",
      textDecoration: "None",
      textTransform: "None",
    },
  },
});
