import { createContext, useContext } from "react";
import { ErrorSpring, LoginTypes } from "./Types";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

export const LoginContext = createContext<LoginTypes>({
  email: null,
  setEmail: () => {
    console.log("Function setEmail in loginContext not set yet");
  },
  username: null,
  setUsername: () => {
    console.log("Function setUsername in loginContext not set yet");
  },
  creationDate: null,
  setCreationDate: () => {
    console.log("Function setCreationDate in loginContext not set yet");
  },
  roles: [],
  setRoles: () => {
    console.log("Function setRoles in loginContext not set yet");
  },
  isLogged: false,
  setIsLogged: () => {
    console.log("Function isLogged in loginContext not set yet");
  },
});

export const useErrorHandler = () => {
  const navigate = useNavigate();
  const loginStatus: LoginTypes = useContext(LoginContext);

  return async (
    response: Response,
    error403Message?: string,
    error409Message?: string
  )=> {

    if (response.ok){
      return;
    }

    if (response.status === 401) {
      loginStatus.setIsLogged(false);
      navigate("/login");
      throw new Error("Necesitas hacer login");

    } else if (response.status === 403) {
      throw new Error(error403Message ?? "Error 403, no tienes permiso para la acción que intentas realizar");

    } else if (response.status === 409) {
      throw new Error(error409Message ?? "Error 409, ha ocurrido un conflicto");

    } else {
        const contentType = response.headers.get("content-type");

        //Checking if the response is a JSON
        if (contentType?.includes("application/json")) {
          const errorSpring: ErrorSpring = await response.json();
          throw new Error("Error " + response.status + " from backend - " + errorSpring.message);
        }

        //If it is not a JSON we just use the text or the response status
        const text = await response.text();
        throw new Error("Error " + response.status + " from Backend - " + (text || "Unknown error"));
    }
  }
}