import { createContext } from "react";
import { enqueueSnackbar } from "notistack";
import { NavigateFunction } from "react-router-dom";
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

export const handleCheckStatus = (
  statusNumber: number,
  navigate: NavigateFunction,
  loginStatus: LoginTypes
) => {
  switch (statusNumber) {
    case 401 | 403: {
      loginStatus.setIsLogged(false);
      navigate("/login");
      enqueueSnackbar("Login or sign up, please", {
        variant: "info",
      });
      break;
    }
    case 419: {
      loginStatus.setIsLogged(false);
      navigate("/login");
      enqueueSnackbar("Last session has expired, please login again", {
        variant: "error",
      });
      break;
    }
    default: {
      break;
    }
  }

  return statusNumber >= 200 && statusNumber < 300;
};

export const treeData = {
  nodeId: "1",
  label: "Main",
  children: [
    {
      nodeId: "2",
      label: "Child 1",
      children: [
        {
          nodeId: "3",
          label: "Grandchild 1",
        },
        {
          nodeId: "4",
          label: "Grandchild 2",
        },
      ],
    },
    {
      nodeId: "5",
      label: "Child 2",
      children: [
        {
          nodeId: "6",
          label: "Grandchild 3",
        },
      ],
    },
  ],
};
