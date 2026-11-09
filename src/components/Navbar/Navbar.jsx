import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./navbar.module.scss";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import { useStore } from "../../store/store";
import useBreakpoint from "../../hooks/useBreakpoint";

const Navbar = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const auth = useStore((s) => s.auth);
  const logout = useStore((s) => s.logout);
  const { isPhone } = useBreakpoint();
  const [accountMenuAnchor, setAccountMenuAnchor] = React.useState(null);

  const handleLogout = () => {
    setAccountMenuAnchor(null);
    logout();
    // Drop cached responses fetched with the old user's token
    queryClient.clear();
    navigate("/login");
  };

  return (
    // mb and logo height are mirrored in --navbar-height (index.css)
    <Box sx={{ mb: { xs: 2, sm: 6 } }}>
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
          {auth && isPhone ? (
            <>
              <Tooltip title="Account">
                <IconButton
                  color="inherit"
                  aria-label="Account"
                  aria-haspopup="true"
                  aria-controls={accountMenuAnchor ? "account-menu" : undefined}
                  onClick={(event) => setAccountMenuAnchor(event.currentTarget)}
                  sx={{ mx: 1 }}
                >
                  <AccountCircleIcon />
                </IconButton>
              </Tooltip>
              <Menu
                id="account-menu"
                anchorEl={accountMenuAnchor}
                open={Boolean(accountMenuAnchor)}
                onClose={() => setAccountMenuAnchor(null)}
              >
                <MenuItem disabled>{auth.user?.username}</MenuItem>
                <MenuItem onClick={handleLogout}>Log out</MenuItem>
              </Menu>
            </>
          ) : auth ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mx: 2 }}>
              <Typography variant="body2">{auth.user?.username}</Typography>
              <Button color="inherit" onClick={handleLogout}>
                Log out
              </Button>
            </Box>
          ) : (
            <Button color="inherit" component={Link} to="/login" sx={{ mx: 2 }}>
              Log in
            </Button>
          )}
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
