import { useState, useMemo, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useLocation } from "react-router-dom";
import getTheme from "./theme";
import AppRoutes from "./routes";

export default function App() {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes toggleTheme={toggleTheme} mode={mode} />
    </ThemeProvider>
  );
}