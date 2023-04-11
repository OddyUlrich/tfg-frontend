import { LinkProps } from "@mui/material";
import { Path } from "@remix-run/router/history";

export interface LinkRouterProps extends LinkProps {
  to: string | Partial<Path>;
  replace?: boolean;
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

export type ErrorSpring = {
  timestamp?: string;
  status: number;
  error: string;
  trace?: string;
  message: string;
  path: string;
};
