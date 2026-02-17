import { createTheme } from "@mui/material/styles";

const getTheme = (direction = "ltr") =>
  createTheme({
    direction,
    palette: {
      primary: {
        light: "#0594a9",
        main: "#0594a9",
        dark: "#0594a9",
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

export { getTheme };
