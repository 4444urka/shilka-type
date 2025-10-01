import { Box, Text, type BoxProps } from "@chakra-ui/react";
import React from "react";
import RestartButton from "../RestartButton/RestartButton";

export interface VictoryScreenProps extends BoxProps {
  correctlyTypedWordsCount: number;
  accuracy: number;
  shilkaCoins: {
    value: number;
  };
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  correctlyTypedWordsCount,
  accuracy,
  shilkaCoins,
}) => {
  return (
    <Box
      animation="fadeIn 0.5s ease-in-out"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={4}
    >
      <Text
        textStyle="body"
        fontSize={"3xl"}
        display="flex"
        gap={2}
        flexDirection="row"
      >
        WPM:
        <Text as="span" color="primaryColor">
          {correctlyTypedWordsCount * 2}
        </Text>
      </Text>

      <Text
        textStyle="body"
        fontSize={"3xl"}
        display="flex"
        gap={2}
        flexDirection="row"
      >
        Accuracy:
        <Text as="span" color="primaryColor">
          {accuracy.toFixed(0)}%
        </Text>
      </Text>
      <RestartButton onClick={() => window.location.reload()} />
      <Box
        position="fixed"
        top="55px "
        textStyle="body"
        fontSize="18px"
        color="primaryColor"
        opacity="0"
        right="209px"
        animation="counterAnimation 2s ease-in-out"
      >
        {shilkaCoins.value > 0 ? "+" : ""}
        {shilkaCoins.value}
      </Box>
    </Box>
  );
};

export default VictoryScreen;
