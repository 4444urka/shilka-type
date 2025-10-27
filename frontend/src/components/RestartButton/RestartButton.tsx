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
      size="lg"
      color="primaryColor"
      onClick={handleClick}
      onMouseDown={(e) => e.preventDefault()}
      {...rest}
    >
      <VscDebugRestart />
    </IconButton>
  );
};

export default RestartButton;
