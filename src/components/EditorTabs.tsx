import { MyTreeNode } from "../Types";
import { editor } from "monaco-editor";
import React from "react";
import { IconButton, Tab, Tabs } from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

export interface MyTab {
  node: MyTreeNode;
  modelMonacoEditor: editor.ITextModel | null | undefined;
}

interface TabsProps {
  myTabs: MyTab[];
  activeTab: number;
  onTabClick: (event: React.SyntheticEvent, index: number) => void;
  onCloseClick: (index: number) => void;
}

export const EditorTabs: React.FC<TabsProps> = ({
  myTabs,
  activeTab,
  onTabClick,
  onCloseClick,
}) => {
  return (
    <Tabs
      value={activeTab}
      onChange={onTabClick}
      variant="scrollable"
      scrollButtons={true}
      allowScrollButtonsMobile
      aria-label="scrollable auto file tab"
    >
      {myTabs.map((tab, index) => (
        <Tab
          sx={{
            border: 1,
            borderBottom: 0,
            borderRadius: "6px 6px 0 0",
            padding: "8px 12px",
          }}
          key={tab.node.label}
          label={
            <span>
              {tab.node.label}
              <IconButton
                className="editor-close-button"
                component="div"
                title={"Close tab"}
                onClick={() => onCloseClick(index)}
              >
                <HighlightOffIcon />
              </IconButton>
            </span>
          }
        />
      ))}
    </Tabs>
  );
};