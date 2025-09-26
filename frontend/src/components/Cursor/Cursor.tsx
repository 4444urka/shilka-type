import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Cursor = () => {
  return (
    <MotionBox
      layoutId="typing-cursor"
      initial={false}
      display="inline-block"
      width="3px"
      height="2rem"
      bg="primaryColor"
      animation="blink 0.7s infinite"
      position="relative"
      top="6px"
      transition={{ type: "spring", stiffness: 2000, damping: 150 }}
    />
  );
};

export default Cursor;
