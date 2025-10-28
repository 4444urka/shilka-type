import { Button, type ButtonProps } from "@chakra-ui/react";
import React from "react";

export interface SettingsBarButtonProps extends ButtonProps {
  children?: React.ReactNode;
}

const SettingsBarButton: React.FC<SettingsBarButtonProps> = ({
  children,
  ...rest
}) => {
  return (
    <Button
      size="sm"
      variant="ghost"
      onMouseDown={(e) => e.preventDefault()}
      minW="60px"
      fontWeight="medium"
      _hover={{
        bg: "bgCardSecondaryColor",
        transform: "scale(1.02)",
        transition: "all 0.2s",
      }}
      _active={{
        transform: "scale(0.95)",
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default SettingsBarButton;
