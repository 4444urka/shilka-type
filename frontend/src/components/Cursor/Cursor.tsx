import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Cursor = () => {
  return (
    <MotionBox
      layout
      initial={false}
      display="inline-block"
      width="3px"
      height="2rem"
      bg="primaryColor"
      animation="blink 0.7s infinite"
      position="relative"
      top="6px"
      transition={{ type: "spring", stiffness: 500, damping: 4100 }}
    />
  );
};

export default Cursor;
