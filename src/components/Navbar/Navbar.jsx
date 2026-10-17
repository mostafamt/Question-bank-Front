import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import styles from "./navbar.module.scss";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

const Navbar = () => {
  return (
    <Box sx={{ mb: 6 }}>
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(90deg, #0594a9 0%, #036b7a 100%)",
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link
              to="/"
              style={{
                color: "#fff",
                textDecoration: "none",
              }}
            >
              <div className={styles["logo-box"]}>
                <img src="/assets/logo.png" alt="logo" />
              </div>
            </Link>
          </Typography>
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
