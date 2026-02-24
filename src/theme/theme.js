import { createTheme } from "@mui/material/styles";

const getTheme = (direction = "ltr") => {
  const fontFamily =
    direction === "rtl"
      ? '"Almarai", "Roboto", sans-serif'
      : '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  return createTheme({
    direction,
    typography: {
      fontFamily,
    },
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
};

export { getTheme };
