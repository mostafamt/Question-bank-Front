import React, { useEffect, useMemo } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar/Navbar";
import "iframe-resizer/js/iframeResizer.contentWindow"; // add this
import Footer from "./components/Footer/Footer";
import { ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import { getTheme } from "./theme/theme";
import { useStore } from "./store/store";
import routes from "./routes";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import "bootstrap/dist/css/bootstrap.min.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Modal from "./components/Modal/Modal";

const queryClient = new QueryClient();

const ltrCache = createCache({ key: "mui-ltr" });
const rtlCache = createCache({ key: "mui-rtl", stylisPlugins: [prefixer, rtlPlugin] });

function App() {
  const language = useStore((s) => s.language);
  const direction = language === "ar" ? "rtl" : "ltr";
  const theme = useMemo(() => getTheme(direction), [direction]);
  const cache = direction === "rtl" ? rtlCache : ltrCache;

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Navbar />
            <ToastContainer />
            <ErrorBoundary>
              <QueryClientProvider client={queryClient}>
                <Modal />
                <Routes>
                  {routes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      Component={route.component}
                    />
                  ))}
                </Routes>
              </QueryClientProvider>
            </ErrorBoundary>
            <Footer />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
