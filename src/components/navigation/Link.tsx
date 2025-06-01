import { HashLinkProps } from "../../Types";
import { Link as LinkMUI } from "@mui/material";
import { HashLink } from "react-router-hash-link";
import React from "react";

export const Link = React.forwardRef<HTMLAnchorElement, HashLinkProps>((props, ref) => {
  return <LinkMUI {...props} component={HashLink} ref={ref} />;
});