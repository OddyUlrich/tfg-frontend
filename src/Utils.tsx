import { Link as LinkMUI } from "@mui/material";
import { Link as ReactLink } from "react-router-dom";
import React from "react";
import { LinkRouterProps } from "./Types";

export function Link(props: LinkRouterProps) {
  return <LinkMUI {...props} component={ReactLink} />;
}
