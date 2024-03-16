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
          <Routes>
            {routes.map((route) => (
              <Route path={route.path} Component={route.component} />
            ))}
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
