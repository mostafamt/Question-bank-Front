import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar/Navbar";
import "iframe-resizer/js/iframeResizer.contentWindow"; // add this
import Footer from "./components/Footer/Footer";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/theme";
import routes from "./routes";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModalRegistry } from "./components/Modals";
import RequireAuth from "./components/RequireAuth/RequireAuth";
import "bootstrap/dist/css/bootstrap.min.css";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
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
              <ModalRegistry />
              <Routes>
                {routes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      route.public ? (
                        <route.component />
                      ) : (
                        <RequireAuth>
                          <route.component />
                        </RequireAuth>
                      )
                    }
                  />
                ))}
              </Routes>
            </ErrorBoundary>
            <Footer />
          </div>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
