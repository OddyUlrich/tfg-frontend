import { Link as LinkMUI } from "@mui/material";
import React from "react";
import { LinkRouterProps } from "./Types";
import { HashLink } from "react-router-hash-link";

export function Link(props: LinkRouterProps) {
  return <LinkMUI {...props} component={HashLink} />;
}

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
