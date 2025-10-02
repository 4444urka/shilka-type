import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Cursor = () => {
  return (
    <MotionBox
      layout
      initial={{ opacity: 1 }}
      animate={{
        opacity: [1, 0, 1],
        scale: [1, 0.9, 1],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
        layout: { type: "spring", stiffness: 1, damping: 300 },
      }}
      display="inline-block"
      width="3px"
      height="2rem"
      bg="primaryColor"
      position="relative"
      top="6px"
      transformOrigin="center"
    />
  );
};

export default Cursor;
