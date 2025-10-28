import { Box, Icon, IconButton, type BoxProps } from "@chakra-ui/react";
import React from "react";
import { BsKeyboardFill } from "react-icons/bs";
import { IoStatsChartSharp } from "react-icons/io5";
import { NavLink } from "react-router-dom";
import Typed from "typed.js";
import { useIsAuthed } from "../../hooks/useIsAuthed";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

interface HeaderProps extends BoxProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = () => {
  const el = React.useRef(null);
  const isAuthed = useIsAuthed();

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
      bg="bgPage"
      py={5}
      px="200px"
      fontSize="3xl"
      fontWeight="bold"
      borderBottom={"1px solid"}
      borderColor={"borderColor"}
    >
      <NavLink to="/">
        <Box display="flex" alignItems="center" gap={2} cursor="pointer">
          <Icon as={BsKeyboardFill} color="primaryColor" />
          <span ref={el} />
        </Box>
      </NavLink>

      <Box display="flex" gap={2} alignItems="center">
        <ThemeToggle />
        <NavLink
          to={isAuthed ? "/stats" : "/signin"}
          style={{
            width: "40px",
            height: "40px",
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
          }}
        >
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
    </Box>
  );
};

export default Header;
