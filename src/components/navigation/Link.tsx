import { HashLinkProps } from "../../Types";
import { Link as LinkMUI } from "@mui/material";
import { HashLink } from "react-router-hash-link";

export function Link(props: HashLinkProps) {
  return <LinkMUI {...props} component={HashLink} />;
}
