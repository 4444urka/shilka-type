import "./App.css";
import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router";
import { useEffect } from "react";
import { useAppDispatch } from "./store";
import { initializeUser } from "./slices/userSlice";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import PageLoader from "./components/PageLoader";

// Lazy loaded pages
const Homepage = lazy(() => import("./pages/Homepage/Homepage"));
const SignUp = lazy(() => import("./pages/SignUp/SignUp"));
const SignIn = lazy(() => import("./pages/SignIn/SignIn"));
const Stats = lazy(() => import("./pages/Stats/Stats"));
const PageNotFound = lazy(() => import("./pages/PageNotFound/PageNotFound"));

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeUser());
  }, [dispatch]);

  const location = useLocation();

  const knownRoutes = ["/", "/signup", "/signin", "/stats"];
  const isKnownRoute = knownRoutes.includes(location.pathname);

  return (
    <ErrorBoundary>
      {isKnownRoute && <Header />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
      {isKnownRoute && <Footer />}
    </ErrorBoundary>
  );
};

export default App;
