import { Component, type ReactNode, type ErrorInfo } from "react";
import { Box, Text, Button } from "@chakra-ui/react";
import { VscDebugRestart } from "react-icons/vsc";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleReload = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
          p={8}
          textAlign="center"
          animation="fadeIn 0.5s ease-in-out"
        >
          <Text
            textStyle="header"
            fontSize={{ base: "2xl", md: "3xl" }}
            color="errorColor"
            mb={4}
          >
            Упс! Что-то пошло не так 😕
          </Text>

          <Text
            textStyle="body"
            fontSize={{ base: "md", md: "lg" }}
            color="textColor"
            mb={6}
            maxW="500px"
          >
            Произошла неожиданная ошибка. Попробуйте перезагрузить страницу или начать заново.
          </Text>

          {import.meta.env.DEV && this.state.error && (
            <Box
              bg="bgCardColor"
              p={4}
              borderRadius="md"
              mb={6}
              maxW="600px"
              w="100%"
              textAlign="left"
              overflow="auto"
            >
              <Text
                fontFamily="monospace"
                fontSize="sm"
                color="errorColor"
                whiteSpace="pre-wrap"
                wordBreak="break-word"
              >
                {this.state.error.toString()}
              </Text>
              {this.state.errorInfo && (
                <Text
                  fontFamily="monospace"
                  fontSize="xs"
                  color="gray.500"
                  mt={2}
                  whiteSpace="pre-wrap"
                  wordBreak="break-word"
                >
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </Box>
          )}

          <Box display="flex" gap={4} flexWrap="wrap" justifyContent="center">
            <Button
              onClick={this.handleRetry}
              variant="outline"
              color="primaryColor"
              borderColor="primaryColor"
              _hover={{ bg: "bgCardColor" }}
              gap={2}
            >
              <VscDebugRestart />
              Попробовать снова
            </Button>

            <Button
              onClick={this.handleReload}
              bg="primaryColor"
              color="white"
              _hover={{ opacity: 0.9 }}
            >
              Перезагрузить страницу
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
