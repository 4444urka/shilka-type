import { Text, type TextProps } from "@chakra-ui/react";
import React from "react";

interface TimerProps extends TextProps {
  children?: React.ReactNode;
}

const Timer: React.FC<TimerProps> = ({ children, ...rest }) => {
  return (
    <Text
      textStyle="body"
      color="primaryColor"
      transition="opacity 0.3s"
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Timer;
