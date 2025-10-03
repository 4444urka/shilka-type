import "./App.css";
import Header from "./components/Header/Header";
import Homepage from "./pages/Homepage/Homepage";
import { Route, Routes, useLocation } from "react-router";
import SignUp from "./pages/SignUp/SignUp";
import SignIn from "./pages/SignIn/SignIn";
import Stats from "./pages/Stats/Stats";
import PageNotFound from "./pages/PageNotFound/PageNotFound";
import { useEffect } from "react";
import { useAppDispatch } from "./store";
import { initializeUser } from "./slices/userSlice";

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeUser());
  }, [dispatch]);

  const location = useLocation();

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
