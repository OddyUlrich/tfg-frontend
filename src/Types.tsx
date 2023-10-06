import { LinkProps } from "@mui/material";
import { DateTime } from "luxon";
import { Path } from "react-router-dom";

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

export interface MyTreeNode {
  nodeId: string;
  label: string;
  file?: ExerciseFile | null;
  children: MyTreeNode[];
}

export type Exercise = {
  id: string;
  name: string;
  tags: Tag[];
  favorite: boolean;
  batteryName: string;
  numberErrorsSolution: number;
  statusSolution: string;
};

export type Tag = {
  name: string;
};

export type EditorData = {
  filesForDisplay: ExerciseFile[];
  templateFiles: ExerciseFile[];
  solutions: Solution[];
  exercise: EditorExercise;
};

export type ExerciseFile = {
  id: string;
  name: string;
  path: string;
  content: string;
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
