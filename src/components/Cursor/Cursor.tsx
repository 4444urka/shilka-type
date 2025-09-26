import { Box } from "@chakra-ui/react";

const Cursor = () => {
  return (
    <Box
      as="span"
      display="inline-block"
      width="3px"
      height="2rem"
      backgroundColor="primaryColor"
      animation="blink 0.7s infinite"
      mr="1px"
      position="relative"
      top="6px"
    />
  );
};

export default Cursor;
