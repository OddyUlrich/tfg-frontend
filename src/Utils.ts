import { createContext } from "react";
import { LoginTypes } from "./Types";

export const LoginContext = createContext<LoginTypes>({
  email: null,
  setEmail: () => {
    console.log("Function not set yet");
  },
  username: null,
  setUsername: () => {
    console.log("Function not set yet");
  },
  creationDate: null,
  setCreationDate: () => {
    console.log("Function not set yet");
  },
  roles: [],
  setRoles: () => {
    console.log("Function not set yet");
  },
  isLogged: false,
  setIsLogged: () => {
    console.log("Function not set yet");
  },
});
