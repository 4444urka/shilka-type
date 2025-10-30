import React from "react";
import type { Theme } from "../../api/themes/themesRequests";
import { Box, HStack, Spinner, Text } from "@chakra-ui/react";
import ThemeSelectorSwatch from "../ThemeSelectorSwatch/ThemeSelectorSwatch";

export interface ThemeItemProps {
  t: Theme;
  idx: number;
  focusedIndex: number | null;
  itemRefs: React.RefObject<(HTMLButtonElement | null)[]>;
  selectingId?: number | null;
  setFocusedIndex: (idx: number | null) => void;
  handleSelect: (themeId: number) => Promise<void>;
}

const ThemeItem: React.FC<ThemeItemProps> = ({
  t,
  idx,
  focusedIndex,
  itemRefs,
  selectingId,
  handleSelect,
  setFocusedIndex,
}) => {
  const bg = t.theme_data?.colors?.bgCardColor?.value as string | undefined;
  const primary = t.theme_data?.colors?.primaryColor?.value as
    | string
    | undefined;
  const text =
    (t.theme_data?.colors?.textPrimary?.value as string | undefined) ||
    (t.theme_data?.colors?.textColor?.value as string | undefined);

  const isFocused = focusedIndex === idx;

  return (
    <Box
      key={t.id}
      ref={(el: HTMLButtonElement | null) => (itemRefs.current[idx] = el)}
      as="button"
      onClick={() => handleSelect(t.id)}
      border="none"
      textAlign="left"
      px={3}
      py={2}
      borderRadius="md"
      onFocus={() => {
        setFocusedIndex(idx);
      }}
      _hover={{ bg: "bgCardColor" }}
      _focus={{ outline: "none" }}
      _before={
        isFocused
          ? {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.5,
              bg: "primaryColor",
              borderRadius: "inherit",
              zIndex: 0,
            }
          : undefined
      }
      position="relative"
    >
      <HStack justify="space-between" width="full">
        <HStack gap={3} align="center" w="full">
          <HStack align="start" gap={2} w="full">
            <Text fontSize="sm" zIndex={1}>
              {t.name}
            </Text>
            <Text fontSize="xs" opacity="0.6" zIndex={1}>
              by @{t.author_username}
            </Text>
          </HStack>
          <ThemeSelectorSwatch
            bgColor={bg}
            primaryColor={primary}
            textColor={text}
            bgOpacity={isFocused ? 0 : 0.3}
          />
        </HStack>

        {selectingId === t.id ? <Spinner size="xs" /> : null}
      </HStack>
    </Box>
  );
};

export default ThemeItem;
