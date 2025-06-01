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
import { ErrorSpring, LoginTypes, User } from "../Types";
import { useContext, useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";
import { Link } from "../components/navigation/Link";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../Utils";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import validator from "validator";

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

  const [showUsernameError, setShowUsernameError] = React.useState(false);
  const [usernameMessage, setUsernameMessage] = React.useState("");
  const [showEmailError, setShowEmailError] = React.useState(false);
  const [emailMessage, setEmailMessage] = React.useState("");
  const [showPassError, setShowPassError] = React.useState(false);
  const [passMessage, setPassMessage] = React.useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckboxDisabled, setIsCheckboxDisabled] = React.useState(true);
  const [isCheckboxChecked, setIsCheckboxChecked] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleLinkClick = () => {
    setIsCheckboxDisabled(false);
    setIsCheckboxChecked(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    if (!data.get("username")) {
      setShowUsernameError(true);
      setUsernameMessage("The username field must be filled in");
      return;
    }
    setShowUsernameError(false);
    setUsernameMessage("");

    const email = data.get("email");
    if (!email) {
      setShowEmailError(true);
      setEmailMessage("The email field must be filled in");
      return;
    } else if (!validator.isEmail(email.toString())) {
      setShowEmailError(true);
      setEmailMessage("Email format is not correct");
      return;
    }
    setShowEmailError(false);
    setEmailMessage("");

    if (!data.get("password")) {
      setShowPassError(true);
      setPassMessage("The password field must be filled in");
      return;
    }
    setShowPassError(false);
    setPassMessage("");

    //TODO VER QUE HACER CON ESTO
    if (!data.get("readDocument")) {
      enqueueSnackbar(
        "You must read the document and mark the checkbox to continue",
        {
          variant: "error",
        }
      );
      return;
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
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorSpring: ErrorSpring = await response.json();


            //TODO CHECK QUE ESTE MENSAJE DE ERROR LLEGA CORRECTAMENTE DESDE BACKEND, SINO EN BACKEND -> "ESTE EMAIL YA ESTA ASOCIADO A UNA CUENTA"
            //If the response is a conflict, we should warn the user
            if (response.status === 409) {
              enqueueSnackbar(errorSpring.message, {
                variant: "error",
              });
            }
            throw new Error("Error from backend - " + errorSpring.message);

          } else {
            enqueueSnackbar("Error trying to sign up, please try again", {
              variant: "error",
            });
            throw new Error("Error from backend - " + response.status);
          }
        } else {
          //Cambiar para que si recibimos un response con created se haga un login en el servidor
          const user: User = await response.json();
          if (user !== null) {
            loginStatus.setIsLogged(true);
            loginStatus.setEmail(user.email);
            loginStatus.setUsername(user.username);
            loginStatus.setCreationDate(user.creationDate);
            loginStatus.setRoles(user.roles);
          }

          //Y redireccionamos a la página principal del usuario en cuestión
          navigate("/");
          return;
        }
      } catch (error: any) {
        console.log(error);
      }
    };
    signup();
  };

  const handleEmailBlur = (e: any) => {
    const emailValue: string = e.target.value;
    if (!validator.isEmpty(emailValue) && !validator.isEmail(emailValue)) {
      setShowEmailError(true);
      setEmailMessage("Email format is not correct");
    } else {
      setShowEmailError(false);
      setEmailMessage("");
    }
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
            <Grid size={12}>
              <TextField
                autoComplete="username"
                name="username"
                required
                fullWidth
                id="username"
                label="Username"
                error={showUsernameError}
                helperText={usernameMessage}
                autoFocus
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                onBlur={handleEmailBlur}
                error={showEmailError}
                helperText={emailMessage}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                error={showPassError}
                helperText={passMessage}
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
            <Grid size={12}>
              <FormControlLabel
                sx={{
                  ".MuiFormControlLabel-asterisk": {
                    display: "none",
                  },
                }}
                control={
                  <Checkbox
                    name="readDocument"
                    id="readDocument"
                    required
                    color="primary"
                    disabled={isCheckboxDisabled}
                    checked={isCheckboxChecked}
                  />
                }
                label={
                  <>
                    <Link
                      onClick={handleLinkClick}
                      target="_blank"
                      underline="always"
                      to="/files/Terms_and_Conditions.pdf"
                      download
                    >
                      Pulse aquí
                    </Link>
                    {/*prettier-ignore*/}
                    <span> para leer y aceptar los términos del tratamiento de datos. *</span>
                  </>
                }
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
            <Grid>
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
