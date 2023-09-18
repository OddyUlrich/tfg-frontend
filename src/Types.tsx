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

export type EditorData = {
  exerciseFiles: ExerciseFiles[];
  solutions: Solution[];
  exercise: EditorExercise;
};

export type ExerciseFiles = {
  id: string;
  name: string;
  path: string;
  idFromSolution: string | null;
  editableMethods: EditableMethod[] | null;
};

export type Solution = {
  id: string;
  name: string;
  lastUpdate: DateTime;
  status: solutionStatus;
  numberErrors: number;
};

export type EditorExercise = {
  id: string;
  name: string;
  statement: string;
  rules: string[];
  successCondition: string;
  tags: Tag[];
  idFromBattery: string;
  nameFromBattery: string;
};

export type EditableMethod = {
  name: string;
  line: number;
};

enum solutionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

export type ErrorSpring = {
  timestamp?: string;
  status: number;
  error: string;
  trace?: string;
  message: string;
  path: string;
};
