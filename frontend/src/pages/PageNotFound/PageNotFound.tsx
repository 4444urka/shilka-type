import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      justifyContent="center"
      textStyle="body"
      alignItems="center"
      h="80vh"
      flexDirection="column"
      animation="dropDown 2s ease-in-out"
    >
      <Stack gap={6} alignItems="center">
        <Text fontSize="8xl" fontWeight="bold" color="primaryColor">
          404
        </Text>
        <Text fontSize="3xl" textAlign="center">
          Страница не найдена
        </Text>
        <Text fontSize="2xl" color="gray.500" textAlign="center">
          К сожалению, запрашиваемая страница не существует
        </Text>
        <Button
          onClick={() => navigate("/")}
          bg="primaryColor"
          size="2xl"
          textStyle="input"
          fontSize="lg"
          mt={4}
        >
          Вернуться на главную
        </Button>
      </Stack>
    </Box>
  );
};

export default PageNotFound;
