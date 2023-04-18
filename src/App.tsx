import "./App.css";
import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { StudentHome } from "./pages/StudentHome";
import { About } from "./pages/About";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Navbar } from "./components/Navbar";
import { SnackbarProvider } from "notistack";
import { NotFound } from "./pages/NotFound";
import { ExerciseEditor } from "./pages/ExerciseEditor";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

function App() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const localTheme = localStorage.getItem("theme") ?? "light";
    setIsDark(localTheme === "dark");
  }, []);

  function handleClickTheme() {
    localStorage.setItem("theme", !isDark ? "dark" : "light");
    setIsDark(!isDark);
  }

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={1}>
        <Navbar onClickTheme={handleClickTheme} />
        <div>
          <Routes>
            <Route path="/" element={<StudentHome />} />
            <Route path="/about" element={<About />} />
            <Route path="/exercises/:exerciseId" element={<ExerciseEditor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
