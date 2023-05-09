import React, { useEffect, useMemo, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { StudentHome } from "./pages/StudentHome";
import { About } from "./pages/About";
import {
  CircularProgress,
  createTheme,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
import { Navbar } from "./components/Navbar";
import { SnackbarProvider } from "notistack";
import { NotFound } from "./pages/NotFound";
import { ExerciseEditor } from "./pages/ExerciseEditor";
import Login from "./pages/Login";
import { handleCheckStatus, LoginContext } from "./Utils";
import { RequireAuth } from "./components/RequireAuth";
import { ErrorSpring, User } from "./Types";
import { DateTime } from "luxon";
import SignUp from "./pages/SignUp";

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [creationDate, setCreationDate] = useState<DateTime | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const navigate = useNavigate();

  const stateLogin = useMemo(
    () => ({
      email,
      setEmail,
      username,
      setUsername,
      creationDate,
      setCreationDate,
      roles,
      setRoles,
      isLogged,
      setIsLogged,
    }),
    [email, username, creationDate, roles, isLogged]
  );

  useEffect(() => {
    const localTheme = localStorage.getItem("theme") ?? "light";
    setIsDark(localTheme === "dark");

    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:8080/users/check", {
          method: "GET",
          credentials: "include",
        });

        handleCheckStatus(response.status, navigate, stateLogin);

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorExercise: ErrorSpring = await response.json();
            setIsLoading(false);
            throw new Error("Error from backend - " + errorExercise.message);
          } else {
            setIsLoading(false);
            throw new Error("Error from backend - " + response.status);
          }
        }

        const user: User = await response.json();
        if (user !== null) {
          setIsLogged(true);
          setEmail(user.email);
          setUsername(user.username);
          setCreationDate(user.creationDate);
          setRoles(user.roles);
        }

        setIsLoading(false);
      } catch (error: any) {
        console.log(error);
      }
    };
    checkAuth();
  }, []);

  function handleClickTheme() {
    localStorage.setItem("theme", !isDark ? "dark" : "light");
    setIsDark(!isDark);
  }

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={1}>
        <LoginContext.Provider value={stateLogin}>
          {isLoading ? (
            <div className="centered-mt">
              {" "}
              <CircularProgress />
            </div>
          ) : (
            <>
              <Navbar onClickTheme={handleClickTheme} />
              <div>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <RequireAuth>
                        <StudentHome />
                      </RequireAuth>
                    }
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/about" element={<About />} />
                  <Route
                    path="/exercises/:exerciseId"
                    element={
                      <RequireAuth>
                        <ExerciseEditor />
                      </RequireAuth>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </>
          )}
        </LoginContext.Provider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
