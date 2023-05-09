import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { enqueueSnackbar } from "notistack";
import { ErrorSpring, LoginTypes } from "../Types";
import { useContext, useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";
import { Link } from "../components/Link";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../Utils";

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" to={{ pathname: "" }}>
        MyAPP
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const loginStatus: LoginTypes = useContext(LoginContext);

  const [showEmailError, setShowEmailError] = React.useState(false);
  const [emailMessage, setEmailMessage] = React.useState("");
  const [showPassError, setShowPassError] = React.useState(false);
  const [passMessage, setPassMessage] = React.useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    if (!data.get("username")) {
      setShowEmailError(true);
      setEmailMessage("The username field must be filled in");
      return;
    } else {
      setShowEmailError(false);
      setEmailMessage("");
    }

    if (!data.get("email")) {
      setShowEmailError(true);
      setEmailMessage("The email field must be filled in");
      return;
    } else {
      setShowEmailError(false);
      setEmailMessage("");
    }

    if (!data.get("password")) {
      setShowPassError(true);
      setPassMessage("The password field must be filled in");
      return;
    } else {
      setShowPassError(false);
      setPassMessage("");
    }

    const signup = async () => {
      try {
        const response = await fetch("http://localhost:8080/signup", {
          method: "POST",
          body: JSON.stringify({
            email: data.get("email"),
            username: data.get("username"),
            password: data.get("password"),
          }),
          credentials: "include",
        });

        if (response.status === 403) {
          enqueueSnackbar("There is already a user with that email", {
            variant: "error",
          });
        } else if (response.status === 419) {
          enqueueSnackbar("A user with these credentials already exists", {
            variant: "error",
          });
        } else if (!response.ok) {
          const errorExercise: ErrorSpring = await response.json();
          throw new Error("Error from backend - " + errorExercise.message);
        } else {
          const email = await response.json();
          loginStatus.setIsLogged(true);
          loginStatus.setEmail(email);
          navigate("/");
        }
      } catch (error: any) {
        console.log(error);
      }
    };
    signup();
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoComplete="username"
                name="username"
                required
                fullWidth
                id="username"
                label="Username"
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link to={{ pathname: "/login" }} variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 5 }} />
    </Container>
  );
}
