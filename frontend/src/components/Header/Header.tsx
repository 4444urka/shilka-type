import { Box, Icon } from "@chakra-ui/react";
import React from "react";
import { BsKeyboardFill } from "react-icons/bs";
import Typed from "typed.js";

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = () => {
  const el = React.useRef(null);

  React.useEffect(() => {
    const typed = new Typed(el.current, {
      strings: [
        "shilkatype.",
        "shilkatype.",
        "shilkatype.",
        "shilkatype.",
        "shilkaphilosophy?",
      ],
      typeSpeed: 100,
      startDelay: 1000,
      backDelay: 6000,
      loop: true,
      shuffle: true,
      smartBackspace: true,
      backSpeed: 20,
    });

    return () => {
      typed.destroy();
    };
  }, []);
  return (
    <Box
      textStyle="header"
      display="flex"
      alignItems="center"
      gap={2}
      bg="white"
      py={5}
      px="200px"
      fontSize="3xl"
      fontWeight="bold"
      borderBottom={"1px solid"}
      borderColor={"gray.200"}
    >
      <Icon as={BsKeyboardFill} color="primaryColor" />
      <span ref={el} />
    </Box>
  );
};

export default Header;
