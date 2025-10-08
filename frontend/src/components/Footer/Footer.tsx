import { Box, Flex, Link, Icon, Text, type BoxProps } from "@chakra-ui/react";
import { FaGithub, FaTelegram } from "react-icons/fa";

interface FooterProps extends BoxProps {
  children?: React.ReactNode;
}

const Footer: React.FC<FooterProps> = () => {
  return (
    <Box as="footer" textStyle="body" bg="bgPage" py={6} px="200px" mt="auto">
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align="center"
        gap={4}
      >
        <Text opacity={0.6} fontSize="md" textAlign="center">
          &copy; shilkagod {new Date().getFullYear()}
        </Text>
        <Flex gap={4} align="center">
          <Link
            href="https://github.com/4444urka/shilka-type"
            target="_blank"
            rel="noopener noreferrer"
            opacity={0.5}
            gap={3}
            _hover={{ opacity: 1, color: "primaryColor" }}
            fontSize="lg"
            transition="all 0.2s"
          >
            <Icon as={FaGithub} />
          </Link>
          <Link
            href="https://t.me/shilka_god"
            target="_blank"
            gap={3}
            rel="noopener noreferrer"
            opacity={0.5}
            _hover={{ opacity: 1, color: "primaryColor" }}
            fontSize="lg"
            transition="all 0.2s"
          >
            <Icon as={FaTelegram} />
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Footer;
