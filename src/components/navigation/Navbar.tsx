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
import React from "react";
import myLogo from "../../images/logo192.svg";
import { Link } from "react-router-dom";

interface NavbarProps {
  onClickTheme: () => void;
}

export const Navbar = (props: NavbarProps) => {
  const theme: Theme = useTheme();

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
          <IconButton component={Link} to="/about" color="inherit" size="large">
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
