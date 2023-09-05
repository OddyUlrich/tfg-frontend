import {
  AppBar,
  Box,
  IconButton,
  Stack,
  Theme,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import {
  AccountCircle,
  Brightness4,
  Brightness7,
  Forum,
  Notifications,
} from "@mui/icons-material";
import React, { useContext } from "react";
import myLogo from "../../images/logo192.svg";
import { Link, useNavigate } from "react-router-dom";
import { ErrorSpring, LoginTypes } from "../../Types";
import { enqueueSnackbar } from "notistack";
import { LoginContext } from "../../Utils";

interface NavbarProps {
  onClickTheme: () => void;
}

export const Navbar = (props: NavbarProps) => {
  const theme: Theme = useTheme();
  const navigate = useNavigate();
  const loginStatus: LoginTypes = useContext(LoginContext);

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:8080/close-session", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        enqueueSnackbar("Error trying to logout, please try again", {
          variant: "error",
        });
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorSpring: ErrorSpring = await response.json();
          throw new Error("Error from backend - " + errorSpring.message);
        } else {
          throw new Error("Error from backend - " + response.status);
        }
      } else {
        //User is marked as "not logged" and is redirected to "/login"
        loginStatus.setIsLogged(false);
        enqueueSnackbar("Session closed successfully", {
          variant: "success",
        });
        navigate("/login");
        return;
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton color="inherit" component={Link} to="/">
          <img alt="Logotipo" src={myLogo} height={40} width={40} />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            component={Link}
            to="/"
            variant="h4"
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            MyAPP
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <IconButton component={Link} to="/about" color="inherit" size="large">
            <Forum fontSize="inherit" />
          </IconButton>
          <IconButton component={Link} to="/about" color="inherit" size="large">
            <Notifications fontSize="inherit" />
          </IconButton>
          <IconButton
            /*component={Link} to="/about"*/ onClick={logout}
            color="inherit"
            size="large"
          >
            <AccountCircle fontSize="inherit" />
          </IconButton>
          <IconButton onClick={props.onClickTheme} color="inherit">
            {theme.palette.mode === "dark" ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
