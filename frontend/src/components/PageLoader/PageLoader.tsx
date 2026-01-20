import { Box, Progress } from "@chakra-ui/react";

const PageLoader: React.FC = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="50vh"
      width="100%"
      animation="fadeIn 0.3s ease-in-out"
    >
      <Progress.Root width="200px" size="md" value={null}>
        <Progress.Track bg="bgCardSecondaryColor">
          <Progress.Range bg="primaryColor" />
        </Progress.Track>
      </Progress.Root>
    </Box>
  );
};

export default PageLoader;
