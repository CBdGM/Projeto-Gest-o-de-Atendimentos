import { createTheme } from "@mui/material/styles";

const getTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#7F5AF0", // roxo elegante
      },
      secondary: {
        main: "#2CB67D", // verde suave
      },
      background: {
        default: mode === "dark" ? "#16161A" : "#f5f5f5", // fundo geral
        paper: mode === "dark" ? "#242629" : "#ffffff",  // cards, tabelas
      },
      text: {
        primary: mode === "dark" ? "#FFFFFE" : "#000000",
        secondary: mode === "dark" ? "#94A1B2" : "#555555",
      },
    },
    typography: {
      fontSize: 18,
      fontFamily: "Avenir, Roboto, sans-serif",
    },
  });

export default getTheme;