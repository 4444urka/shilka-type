import "./App.css";
import Header from "./components/Header/Header";
import { BsKeyboardFill } from "react-icons/bs";
import { Icon, Text } from "@chakra-ui/react";
import Homepage from "./pages/Homepage/Homepage";

const App = () => {
  return (
    <>
      <Header>
        <Icon as={BsKeyboardFill} color="primaryColor" />
        <Text>shilkatype.</Text>
      </Header>
      <Homepage />
    </>
  );
};

export default App;
