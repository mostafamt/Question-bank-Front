import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      light: "#0594a9",
      main: "#0594a9",
      dark: "#0594a9",
      contrastText: "#fff",
    },
    secondary: {
      light: "#444",
      main: "#555",
      dark: "#555",
      contrastText: "#fff",
    },
    white: {
      light: "#fff",
      main: "#fff",
      dark: "#ba000d",
      contrastText: "#000",
    },
  },
});

export { theme };
