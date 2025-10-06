import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Cursor = () => {
  return (
    <MotionBox
      layoutId="typing-cursor"
      initial={{ opacity: 1, scaleY: 1 }}
      animate={{
        opacity: [1, 0, 1],
        scaleY: [1, 0.95, 1],
      }}
      transition={{
        opacity: {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        },
        scaleY: {
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        },
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 25,
          duration: 0.3,
        },
      }}
      display="inline-block"
      width="3px"
      height="2rem"
      bg="primaryColor"
      position="relative"
      transformOrigin="center bottom"
      borderRadius="2px"
    />
  );
};

export default Cursor;
