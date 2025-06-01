import React, { FC } from "react";
import { styled } from "@mui/material/styles";
import { TreeItem, treeItemClasses, TreeItemProps } from "@mui/x-tree-view/TreeItem";
import { alpha, Collapse } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { useSpring, animated } from "@react-spring/web";
import { MyTreeNode } from "../Types";

interface MyTreeItemProps {
  nodeId: string;
  label: string;
  children: MyTreeNode[];
}

const AnimatedCollapse = animated(Collapse);

function TransitionComponent(props: TransitionProps & { children?: React.ReactNode }) {
  const style = useSpring({
    opacity: props.in ? 1 : 0,
  });

  return (
    <AnimatedCollapse {...props} style={style}>
      {props.children}
    </AnimatedCollapse>
  );
}

const StyledTreeItem = styled((props: TreeItemProps) => (
  <TreeItem {...props} slots={{groupTransition: TransitionComponent}} />
))(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer}`]: {
    "& .close": {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

const MyTreeItem: FC<MyTreeItemProps> = ({ nodeId, label, children }) => {
  return (
    <StyledTreeItem itemId={nodeId} label={label}>
      {children &&
        children.map((child) => (
          <MyTreeItem
            key={child.nodeId}
            nodeId={child.nodeId}
            label={child.label}
            children={child.children}
          />
        ))}
    </StyledTreeItem>
  );
};

export default MyTreeItem;
