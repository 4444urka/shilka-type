import "./App.css";
import Header from "./components/Header/Header";
import Homepage from "./pages/Homepage/Homepage";
import { Route, Routes, useLocation } from "react-router";
import SignUp from "./pages/SignUp/SignUp";
import SignIn from "./pages/SignIn/SignIn";
import Stats from "./pages/Stats/Stats";
import PageNotFound from "./pages/PageNotFound/PageNotFound";
import { useInitAuth } from "./hooks/useInitAuth";

const App = () => {
  // Инициализируем аутентификацию из cookie при загрузке
  useInitAuth();

  const location = useLocation();

  // Список известных маршрутов
  const knownRoutes = ["/", "/signup", "/signin", "/stats"];
  const isKnownRoute = knownRoutes.includes(location.pathname);

  return (
    <>
      {isKnownRoute && <Header />}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

export default App;
