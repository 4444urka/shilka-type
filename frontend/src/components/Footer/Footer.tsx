import { Box, Flex, Link, Icon, Text, type BoxProps } from "@chakra-ui/react";
import React from "react";
import { FaGithub, FaTelegram } from "react-icons/fa";
import { getMyAppVer } from "../../api/github/githubRequests";
import ThemeSelectorMenu from "../ThemeSelectorMenu/ThemeSelectorMenu";
import ChangelogModal from "../ChangelogModal/ChangelogModal";

interface FooterProps extends BoxProps {
  children?: React.ReactNode;
}

const Footer: React.FC<FooterProps> = () => {
  const [version, setVersion] = React.useState<string>("");
  const [changelogOpen, setChangelogOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchVersion = async () => {
      const appVersion = await getMyAppVer();
      setVersion(appVersion);
    };
    fetchVersion();
  }, []);

  return (
    <Box
      as="footer"
      textStyle="body"
      fontSize={{ base: "sm", md: "md" }}
      bg="bgPage"
      py={{ base: 4, md: 6 }}
      px={{ base: 10, xl: 200 }}
      mt="auto"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align="center"
        gap={4}
      >
        <Box
          opacity={0.6}
          textAlign="center"
          display="flex"
          flexDirection={{ base: "column", md: "row" }}
          gap={2}
          alignItems="center"
          justifyContent="center"
        >
          <Text>&copy; shilkagod {new Date().getFullYear()}</Text>
          <Text
            animation="fadeIn 1s ease-in-out"
            cursor="pointer"
            _hover={{ opacity: 1, color: "primaryColor" }}
            transition="all 0.2s"
            onClick={() => setChangelogOpen(true)}
          >
            {version}
          </Text>
        </Box>
        <Flex gap={4} align="center">
          <ThemeSelectorMenu />
          <Link
            href="https://github.com/4444urka/shilka-type"
            target="_blank"
            rel="noopener noreferrer"
            color="textColor"
            opacity={0.6}
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
            color="textColor"
            opacity={0.6}
            _hover={{ opacity: 1, color: "primaryColor" }}
            fontSize="lg"
            transition="all 0.2s"
          >
            <Icon as={FaTelegram} />
          </Link>
        </Flex>
      </Flex>

      <ChangelogModal
        open={changelogOpen}
        onOpenChange={(details) => setChangelogOpen(details.open)}
      />
    </Box>
  );
};

export default Footer;
