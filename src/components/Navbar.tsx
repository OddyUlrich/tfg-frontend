import { AppBar, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import { AccountCircle, Forum, Notifications } from "@mui/icons-material";
import React from "react";
import { Link } from "react-router-dom";
import myLogo from "../images/logo192.svg";

export const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton color="inherit" component={Link} to="/">
          <img alt="Logotipo" src={myLogo} height={40} width={40} />
        </IconButton>
        <Typography
          component={Link}
          to="/"
          variant="h4"
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
        >
          MyAPP
        </Typography>
        <Stack direction="row" spacing={2}>
          <IconButton component={Link} to="/about" color="inherit" size="large">
            <Forum fontSize="inherit" />
          </IconButton>
          <IconButton component={Link} to="/about" color="inherit" size="large">
            <Notifications fontSize="inherit" />
          </IconButton>
          <IconButton component={Link} to="/about" color="inherit" size="large">
            <AccountCircle fontSize="inherit" />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
