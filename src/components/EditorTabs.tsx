import { MyTreeNode } from "../Types";
import { editor } from "monaco-editor";
import React from "react";
import Box from "@mui/material/Box";
import { Theme, useTheme } from "@mui/material";

export interface Tab {
  node: MyTreeNode;
  modelMonacoEditor: editor.ITextModel | null | undefined;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: number;
  onTabClick: (index: number) => void;
}

export const EditorTabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabClick,
}) => {
  const theme: Theme = useTheme();

  return (
    <div className="tabs">
      {tabs.map((tab, index) => (
        <Box
          sx={{
            backgroundColor:
              theme.palette.mode === "dark" ? "#4d4d4d" : "#cdcdcd",
          }}
          key={index}
          className={`tab-panel ${index === activeTab ? "active" : ""}`}
          onClick={() => onTabClick(index)}
        >
          {tab.node.file?.name}
        </Box>
      ))}
    </div>
  );
};
