import {
  Box,
  Button,
  Dialog,
  HStack,
  Input,
  InputGroup,
  Kbd,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { MdOutlineKeyboardArrowUp } from "react-icons/md";
import useThemeSelector from "../../hooks/useThemeSelector";
import ThemeItem from "../ThemeItem/ThemeItem";
import ThemeUploader from "../ThemeUploader/ThemeUploader";

const ThemeSelectorMenu: React.FC = () => {
  const {
    open,
    onOpen,
    onClose,
    inputRef,
    itemRefs,
    filteredThemes,
    loading,
    search,
    setSearch,
    selected,
    selectingId,
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    handleSelect,
    load,
    previewTheme,
  } = useThemeSelector();

  return (
    <Box position="relative" textStyle="input">
      <Button
        variant="ghost"
        size="sm"
        onClick={onOpen}
        color="textColor"
        opacity={0.6}
        _hover={{
          opacity: 1,
          color: "primaryColor",
          bg: "bgCardColor",
        }}
      >
        <HStack gap={2} align="center">
          <Box as="span">
            <MdOutlineKeyboardArrowUp />
          </Box>
          <Text>{selected ? selected.name : "Темы"}</Text>
        </HStack>
      </Button>

      <Dialog.Root
        size="lg"
        open={open}
        onOpenChange={(d) => {
          if (d.open) {
            onOpen();
          } else {
            // make sure preview is cleared when dialog closes via UI
            previewTheme(null);
            onClose();
          }
        }}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="bgPage" onKeyDown={handleKeyDown} tabIndex={-1}>
            <Dialog.CloseTrigger />
            <Dialog.Header>
              <HStack gap={2} align="center" w="full">
                <InputGroup
                  startElement={
                    <LuSearch color="var(--chakra-colors-text-color)" />
                  }
                  endElement={
                    <Kbd
                      variant="outline"
                      color="textColor"
                      borderColor="textColor"
                    >
                      ⌘K
                    </Kbd>
                  }
                >
                  <Input
                    ref={inputRef}
                    borderColor="textColor"
                    placeholder="Поиск..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        handleKeyDown(e);
                      } else {
                        e.stopPropagation();
                      }
                    }}
                    size="sm"
                    w="full"
                    color="textColor"
                    _placeholder={{ color: "textColor" }}
                  />
                </InputGroup>
              </HStack>
            </Dialog.Header>
            <Dialog.Body>
              <VStack align="stretch" gap={0}>
                {loading ? (
                  <Box px={3} py={2}>
                    <Spinner size="sm" />
                  </Box>
                ) : filteredThemes.length ? (
                  filteredThemes.map((t, idx) => (
                    <ThemeItem
                      key={t.id}
                      t={t}
                      idx={idx}
                      focusedIndex={focusedIndex}
                      itemRefs={itemRefs}
                      selectingId={selectingId}
                      setFocusedIndex={setFocusedIndex}
                      handleSelect={handleSelect}
                    />
                  ))
                ) : (
                  <Box px={3} py={2}>
                    {search ? "Нет тем по запросу" : "Нет доступных тем"}
                  </Box>
                )}

                <Box height="1px" bg="borderColor" />

                <Box px={3} py={2}>
                  <HStack justify="space-between">
                    <Box>
                      <Text fontSize="sm">Создать тему</Text>
                      <Text fontSize="xs">
                        Загрузите свою тему в формате JSON
                      </Text>
                    </Box>
                    <ThemeUploader
                      onThemeCreated={async () => {
                        await load();
                        onClose();
                      }}
                    />
                  </HStack>
                </Box>
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
};

export default ThemeSelectorMenu;
