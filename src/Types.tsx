import { LinkProps } from "@mui/material";
import { Path } from "react-router-dom";
import { DateTime } from "luxon";

export interface LoginTypes {
  email: string | null;
  setEmail: (newValue: string | null) => void;
  username: string | null;
  setUsername: (newValue: string | null) => void;
  creationDate: DateTime | null;
  setCreationDate: (newValue: DateTime | null) => void;
  roles: string[];
  setRoles: (newValue: string[]) => void;
  isLogged: boolean;
  setIsLogged: (newValue: boolean) => void;
}

export interface User {
  username: string | null;
  email: string | null;
  creationDate: DateTime | null;
  roles: string[];
}

export interface HashLinkProps extends LinkProps {
  to:
    | string
    | Partial<Path>
    | { pathname: string; state: { [key: string]: any } };
  replace?: boolean;
  smooth?: boolean;
}

export type Tag = {
  name: string;
};

export type Exercise = {
  id: string;
  name: string;
  tags: Tag[];
  favorite: boolean;
  batteryName: string;
  numberErrorsSolution: number;
  statusSolution: string;
};

export type ExerciseCode = {
  id: string;
  name: string;
  favorite: boolean;
  exerciseBattery: {
    name: string;
  };
  numberErrorsSolution: number;
  statusSolution: string;
};

export type ErrorSpring = {
  timestamp?: string;
  status: number;
  error: string;
  trace?: string;
  message: string;
  path: string;
};
