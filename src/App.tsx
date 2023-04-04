import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import { StudentHome } from "./pages/StudentHome";
import { About } from "./pages/About";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Navbar } from "./components/Navbar";
import { MyBreadcrumbs } from "./components/MyBreadcrumbs";
import { SnackbarProvider } from "notistack";
import { NotFound } from "./pages/NotFound";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={1}>
        <Navbar />
        <MyBreadcrumbs />
        <div className="container">
          <Routes>
            <Route path="/" element={<StudentHome />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
