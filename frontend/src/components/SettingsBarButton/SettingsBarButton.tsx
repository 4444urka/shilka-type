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
      minW={{ base: "50px", md: "60px" }}
      minH={{ base: "36px", md: "40px" }}
      fontWeight="medium"
      fontSize={{ base: "sm", md: "md" }}
      px={{ base: 2, md: 3 }}
      _hover={{
        bg: "bgCardSecondaryColor",
        transform: "scale(1.02)",
        transition: "all 0.2s",
      }}
      _active={{
        transform: "scale(0.95)",
      }}
      css={{
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default React.memo(SettingsBarButton);
