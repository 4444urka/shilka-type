import { Box, HStack } from "@chakra-ui/react";

export interface ThemeSelectorSwatchProps {
  bgColor?: string;
  primaryColor?: string;
  textColor?: string;
  bgOpacity?: number;
}

const ThemeSelectorSwatch: React.FC<ThemeSelectorSwatchProps> = ({
  bgColor,
  primaryColor,
  textColor,
  bgOpacity,
}) => {
  return (
    <HStack
      gap={1}
      align="center"
      fontSize="xs"
      p={2}
      borderRadius="md"
      position="relative"
      zIndex={1}
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bg: primaryColor || "transparent",
        opacity: bgOpacity,
        borderRadius: "inherit",
        zIndex: -1,
      }}
    >
      <Box
        width="28px"
        height="18px"
        borderRadius="4px"
        bg={bgColor || "transparent"}
        zIndex={1}
        position="relative"
      />
      <Box
        width="28px"
        height="18px"
        borderRadius="4px"
        bg={primaryColor || "transparent"}
        zIndex={1}
        position="relative"
      />
      <Box
        width="28px"
        height="18px"
        borderRadius="4px"
        bg={textColor || "transparent"}
        zIndex={1}
        position="relative"
      />
    </HStack>
  );
};

export default ThemeSelectorSwatch;
