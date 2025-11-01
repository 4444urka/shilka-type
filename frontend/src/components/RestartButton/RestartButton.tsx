import { IconButton, type IconButtonProps } from "@chakra-ui/react";
import React from "react";
import { VscDebugRestart } from "react-icons/vsc";

interface RestartButtonProps extends IconButtonProps {
  onClick: () => void;
}

const RestartButton: React.FC<RestartButtonProps> = ({ onClick, ...rest }) => {
  const handleClick = () => {
    onClick();
    (document.activeElement as HTMLElement)?.blur();
  };

  return (
    <IconButton
      aria-label="Restart"
      variant="ghost"
      alignSelf="center"
      size={{ base: "md", md: "lg" }}
      minW={{ base: "44px", md: "48px" }}
      minH={{ base: "44px", md: "48px" }}
      color="primaryColor"
      fontSize={{ base: "20px", md: "24px" }}
      onClick={handleClick}
      onMouseDown={(e) => e.preventDefault()}
      {...rest}
      _hover={{ bg: "bgCardColor" }}
      _active={{ transform: "scale(0.95)" }}
      css={{
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
    >
      <VscDebugRestart />
    </IconButton>
  );
};

export default RestartButton;
