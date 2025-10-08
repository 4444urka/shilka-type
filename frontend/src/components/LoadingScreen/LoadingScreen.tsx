import { Box, Progress } from "@chakra-ui/react";

interface LoadingScreenProps {
  children?: React.ReactNode;
  isLoading?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      bg="bgPage"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="9999"
      opacity={isLoading ? 1 : 0}
      pointerEvents={isLoading ? "auto" : "none"}
      transition={"0.3s ease-in-out"}
    >
      <Progress.Root width="300px" size="lg" value={null}>
        <Progress.Track>
          <Progress.Range bg="primaryColor" />
        </Progress.Track>
      </Progress.Root>
    </Box>
  );
};

export default LoadingScreen;
