import { Box, Icon, IconButton, type BoxProps } from "@chakra-ui/react";
import React from "react";
import { IoStatsChartSharp } from "react-icons/io5";
import { BsKeyboardFill } from "react-icons/bs";
import Typed from "typed.js";
import { NavLink } from "react-router-dom";

interface HeaderProps extends BoxProps {
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
      justifyContent="space-between"
      bg="white"
      py={5}
      px="200px"
      fontSize="3xl"
      fontWeight="bold"
      borderBottom={"1px solid"}
      borderColor={"gray.200"}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Icon as={BsKeyboardFill} color="primaryColor" />
        <span ref={el} />
      </Box>

      <NavLink to="/signup">
        <IconButton
          variant="ghost"
          opacity={0.6}
          aria-label="Stats"
          _hover={{ opacity: 1, color: "primaryColor" }}
        >
          <IoStatsChartSharp />
        </IconButton>
      </NavLink>
    </Box>
  );
};

export default Header;
