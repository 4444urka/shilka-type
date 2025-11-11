import { Dialog } from "@chakra-ui/react";
import { Box, Text, Link, Spinner, Center } from "@chakra-ui/react";
import React from "react";
import {
  getLatestRelease,
  type GitHubRelease,
} from "../../api/github/githubRequests";

interface ChangelogModalProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [release, setRelease] = React.useState<GitHubRelease | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && !release) {
      const fetchRelease = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await getLatestRelease();
          setRelease(data);
        } catch (err) {
          console.error("Failed to fetch release:", err);
          setError("Не удалось загрузить информацию о релизе");
        } finally {
          setIsLoading(false);
        }
      };
      void fetchRelease();
    }
  }, [open, release]);

  // Функция для парсинга markdown (простая версия)
  const parseMarkdown = (text: string) => {
    const lines = text.split("\n").slice(1);
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Заголовки
      if (line.startsWith("## ")) {
        elements.push(
          <Text
            key={key++}
            fontSize="xl"
            fontWeight="bold"
            mt={4}
            mb={2}
            color="primaryColor"
          >
            {line.replace("## ", "")}
          </Text>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <Text key={key++} fontSize="lg" fontWeight="semibold" mt={3} mb={2}>
            {line.replace("### ", "")}
          </Text>
        );
      }
      // Элементы списка
      else if (line.startsWith("* ")) {
        const content = line.replace("* ", "");
        // Простой парсинг ссылок [text](url)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(content)) !== null) {
          if (match.index > lastIndex) {
            parts.push(content.substring(lastIndex, match.index));
          }
          parts.push(
            <Link
              key={`link-${key}-${match.index}`}
              href={match[2]}
              target="_blank"
              rel="noopener noreferrer"
              color="primaryColor"
              textDecoration="underline"
              _hover={{ opacity: 0.8 }}
            >
              {match[1]}
            </Link>
          );
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < content.length) {
          parts.push(content.substring(lastIndex));
        }

        elements.push(
          <Box key={key++} pl={4} mb={1}>
            • {parts.length > 0 ? parts : content}
          </Box>
        );
      }
      // Пустые строки
      else if (line.trim() === "") {
        continue;
      }
      // Обычный текст
      else {
        elements.push(
          <Text key={key++} mb={2}>
            {line}
          </Text>
        );
      }
    }

    return elements;
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="bgPage" maxH="80vh" overflowY="auto">
          <Dialog.Header borderBottom="1px" borderColor="borderColor">
            <Dialog.Title color="textColor" textStyle="body">
              {release ? `${release.tag_name}` : "История изменений"}
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.CloseTrigger color="textColor" />
          <Dialog.Body py={4}>
            {isLoading && (
              <Center py={8}>
                <Spinner color="primaryColor" size="lg" />
              </Center>
            )}

            {error && (
              <Text color="errorColor" textAlign="center" py={4}>
                {error}
              </Text>
            )}

            {release && !isLoading && (
              <Box>
                <Text color="textColor" opacity={0.6} fontSize="sm" mb={4}>
                  Опубликовано:{" "}
                  {new Date(release.published_at).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>

                <Box color="textColor">{parseMarkdown(release.body)}</Box>

                <Link
                  href={release.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primaryColor"
                  mt={4}
                  display="block"
                  textAlign="center"
                  _hover={{ opacity: 0.8 }}
                >
                  Посмотреть на GitHub →
                </Link>
              </Box>
            )}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default ChangelogModal;
