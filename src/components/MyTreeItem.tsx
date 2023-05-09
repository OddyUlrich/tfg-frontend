import React, { FC } from "react";
import { styled } from "@mui/material/styles";
import TreeItem, { treeItemClasses, TreeItemProps } from "@mui/lab/TreeItem";
import { alpha, Collapse } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { useSpring, animated } from "@react-spring/web";

export interface MyTreeItemProps {
  nodeId: string;
  label: string;
  children?: MyTreeItemProps[];
}

function TransitionComponent(props: TransitionProps) {
  const style = useSpring({
    from: {
      opacity: 0,
    },
    to: {
      opacity: props.in ? 1 : 0,
    },
  });

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  );
}

const StyledTreeItem = styled((props: TreeItemProps) => (
  <TreeItem {...props} TransitionComponent={TransitionComponent} />
))(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer}`]: {
    "& .close": {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

const MyTreeItem: FC<MyTreeItemProps> = ({ nodeId, label, children }) => {
  return (
    <StyledTreeItem nodeId={nodeId} label={label}>
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
