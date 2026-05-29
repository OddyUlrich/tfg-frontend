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
  creationDate: DateTime | null;
  username: string | null;
  email: string | null;
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
  file: ExerciseFile | null;
  children: MyTreeNode[];
}

export type Tag = {
  name: string;
};

export type ExerciseHome = {
  id: string;
  name: string;
  tags: Tag[];
  favorite: boolean;
  batteryName: string;
  numberErrorsSolution: number;
  statusSolution: string;
  creationTimestamp: DateTime;
};

export type BatteryExercise = {
  name: string;
};

export type Solution = {
  id: string;
  name: string;
  lastUpdate: DateTime;
  status: solutionStatus;
  numberErrors: number;
};

export type ExerciseFile = {
  id: string;
  name: string;
  path: string;
  text: string;
  idFromSolution: string | null;
  editableMethods: EditableMethod[];
};

export type CodeEditorData = {
  filesForDisplay: ExerciseFile[];
  templateFiles: ExerciseFile[];
  solutions: Solution[];
  currentSolution: string;
  exercise: Exercise;
};

export type EditableMethod = {
  name: string;
  startLine: number;
  endLine: number;
};

export type Rule = {
  id: number;
  type: string
  name: string;
}

export type Exercise = {
  id: string | null;
  name: string;
  nameFromBattery: string;
  statement: string;
  rules: Rule[];
  tags: Tag[];
  successCondition: string;
};

export type EditorExerciseData = {
  exercise: Exercise;
  files: ExerciseFile[];
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
