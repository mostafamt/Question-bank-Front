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
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
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
            <Routes>
              {routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  Component={route.component}
                />
              ))}
            </Routes>
          </ErrorBoundary>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
