import { Progress, Box } from "@chakra-ui/react";

interface HomepageLoaderProps {
  children?: React.ReactNode;
  isLoading?: boolean;
}

const HomepageLoader: React.FC<HomepageLoaderProps> = ({ isLoading }) => {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      bg="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="9999"
      opacity={isLoading ? 1 : 0}
      transition={"0.3s ease-in-out"}
    >
      <Progress.Root width="300px" colorPalette={"cyan"} size="lg" value={null}>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    </Box>
  );
};

export default HomepageLoader;
