import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./navbar.module.scss";
import { useStore } from "../../store/store";

const Navbar = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const auth = useStore((s) => s.auth);
  const logout = useStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    // Drop cached responses fetched with the old user's token
    queryClient.clear();
    navigate("/login");
  };

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
          {auth ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">{auth.user?.username}</Typography>
              <Button color="inherit" onClick={handleLogout}>
                Log out
              </Button>
            </Box>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
