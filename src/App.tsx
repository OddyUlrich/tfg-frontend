import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Navbar } from "./components/Navbar";
import { MyBreadcrumbs } from "./components/MyBreadcrumbs";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

//Revisar el modo noche una vez mas

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Navbar />
      <MyBreadcrumbs />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
