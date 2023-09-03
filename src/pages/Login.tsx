import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useNavigate } from "react-router-dom";
import validator from "validator";
import { enqueueSnackbar } from "notistack";
import { ErrorSpring, LoginTypes, User } from "../Types";
import { useContext } from "react";
import { LoginContext } from "../Utils";
import { Link } from "../components/navigation/Link";

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

export default function Login() {
  const navigate = useNavigate();
  const loginStatus: LoginTypes = useContext(LoginContext);

  const [showEmailError, setShowEmailError] = React.useState(false);
  const [emailMessage, setEmailMessage] = React.useState("");
  const [showPassError, setShowPassError] = React.useState(false);
  const [passMessage, setPassMessage] = React.useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

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

    const login = async () => {
      try {
        //Primero intentamos hacer login al usuario
        const response = await fetch("http://localhost:8080/login", {
          method: "POST",
          body: JSON.stringify({
            email: data.get("email"),
            password: data.get("password"),
            remember: !!data.get("remember"),
          }),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        /* El servidor responde un 401 si los credenciales no son correctos y
         * en caso de cualquier otro error lanzamos un error*/
        if (response.status === 401) {
          enqueueSnackbar("User not found with these credentials", {
            variant: "error",
          });
        } else if (!response.ok) {
          enqueueSnackbar("Error trying to log in, please try again", {
            variant: "error",
          });
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorExercise: ErrorSpring = await response.json();
            throw new Error("Error from backend - " + errorExercise.message);
          } else {
            throw new Error("Error from backend - " + response.status);
          }
        } else {
          //En caso de hacer login correctamente obtenemos los datos del usuario
          const responseUser = await fetch(
            "http://localhost:8080/users/check",
            {
              method: "GET",
              credentials: "include",
            }
          );

          //De no obtener una respuesta correcta lanzamos un error
          if (!responseUser.ok) {
            enqueueSnackbar("Error retrieving user data, try log in again", {
              variant: "error",
            });
            const contentType = responseUser.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              const errorExercise: ErrorSpring = await responseUser.json();
              throw new Error("Error from backend - " + errorExercise.message);
            } else {
              throw new Error("Error from backend - " + responseUser.status);
            }
          }

          //Si obtenemos el usuario correctamente establecemos sus datos en el contexto
          const user: User = await responseUser.json();
          if (user !== null) {
            loginStatus.setIsLogged(true);
            loginStatus.setEmail(user.email);
            loginStatus.setUsername(user.username);
            loginStatus.setCreationDate(user.creationDate);
            loginStatus.setRoles(user.roles);
          }

          //Y redireccionamos a la página principal del usuario en cuestión
          navigate("/");
        }
      } catch (error: any) {
        console.log(error);
      }
    };
    login();
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
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            onBlur={handleEmailBlur}
            error={showEmailError}
            helperText={emailMessage}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            error={showPassError}
            helperText={passMessage}
          />
          <FormControlLabel
            name="remember"
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link to={{ pathname: "" }} variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link to={{ pathname: "/signup" }} variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}
