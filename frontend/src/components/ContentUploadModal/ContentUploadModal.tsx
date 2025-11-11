import React, { useRef, useState } from "react";
import {
  Button,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
  DialogBackdrop,
  DialogPositioner,
  IconButton,
  Textarea,
  VStack,
  Text,
  Field,
  Portal,
  HStack,
  RadioGroup,
} from "@chakra-ui/react";
import { MdUpload } from "react-icons/md";
import { uploadText } from "../../api/content/contentRequests";

interface ContentUploadModalProps {
  defaultLanguage?: "ru" | "en";
}

const ContentUploadModal: React.FC<ContentUploadModalProps> = ({
  defaultLanguage = "en",
}) => {
  const [open, setOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const [language, setLanguage] = useState<"ru" | "en">(defaultLanguage);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const handleUpload = async () => {
    if (!rawText.trim()) {
      console.warn("Empty text");
      return;
    }

    setLoading(true);
    try {
      const response = await uploadText({
        raw_text: rawText,
        language,
      });

      console.log("Upload success:", response);
      alert(
        `Успешно! Создано слов: ${response.words_created}, предложений: ${response.sentences_created}`
      );

      setRawText("");
      setOpen(false);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Ошибка при загрузке текста");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        aria-label="Upload content"
        variant="ghost"
        size={{ base: "sm", md: "md" }}
        color="textColor"
        _hover={{ color: "primaryColor", bg: "bgCardSecondaryColor" }}
        onClick={() => setOpen(true)}
      >
        <MdUpload />
      </IconButton>

      <DialogRoot
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        size="lg"
        initialFocusEl={() => ref.current}
      >
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent
              bg="bgCardColor"
              color="textColor"
              textStyle="input"
              borderColor="borderColor"
            >
              <DialogHeader>
                <DialogTitle
                  fontSize="xl"
                  fontWeight="bold"
                  color="primaryColor"
                >
                  Загрузить текст
                </DialogTitle>
              </DialogHeader>
              <DialogCloseTrigger />

              <DialogBody>
                <VStack gap={4} align="stretch">
                  <Field.Root>
                    <Field.Label fontSize="sm" fontWeight="medium">
                      Язык текста
                    </Field.Label>
                    <RadioGroup.Root
                      value={language}
                      onValueChange={(e) => setLanguage(e.value as "ru" | "en")}
                      colorPalette="primaryColor"
                    >
                      <HStack gap={4}>
                        <RadioGroup.Item value="ru">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemControl />
                          <RadioGroup.ItemText>Русский</RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="en">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemControl />
                          <RadioGroup.ItemText>English</RadioGroup.ItemText>
                        </RadioGroup.Item>
                      </HStack>
                    </RadioGroup.Root>
                  </Field.Root>

                  <Text fontSize="sm" opacity={0.8}>
                    Вставьте любой текст. Он автоматически будет очищен от
                    лишних символов и разбит на слова и предложения.
                  </Text>

                  <Field.Root>
                    <Textarea
                      ref={ref}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="Вставьте текст здесь..."
                      minHeight="300px"
                      bg="bgCardSecondaryColor"
                      borderColor="borderColor"
                      _focus={{ borderColor: "primaryColor" }}
                    />
                  </Field.Root>

                  <Text fontSize="xs" opacity={0.6}>
                    Примечание: дубликаты будут автоматически пропущены
                  </Text>
                </VStack>
              </DialogBody>

              <DialogFooter gap={2}>
                <Button
                  variant="outline"
                  color="textColor"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Отмена
                </Button>
                <Button
                  bg="primaryColor"
                  color="bgCardColor"
                  _hover={{ opacity: 0.8 }}
                  onClick={handleUpload}
                  loading={loading}
                >
                  Загрузить
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </DialogRoot>
    </>
  );
};

export default ContentUploadModal;
