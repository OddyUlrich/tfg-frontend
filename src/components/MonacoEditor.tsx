import React from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import { useTheme } from "@mui/material";
import { editor } from "monaco-editor";
import { EditorTabs, MyTab } from "./EditorTabs";
import Box from "@mui/material/Box";

export interface RangeRestrictionObject {
  range: [number, number, number, number]; // Should be a positive whole number
  allowMultiline?: boolean;
  label?: string;
  validate?: () => void;
}

interface MonacoEditorProps {
  onValueChange: (value: string | undefined) => void;
  path: string;
  tabs: MyTab[];
  activeTab: number;
  onTabClick: (event: React.SyntheticEvent, index: number) => void;
  onCloseClick: (event: React.MouseEvent<HTMLElement>, index: number) => void;
  onEditorDidMount: (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => void;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  onValueChange,
  path,
  tabs,
  activeTab,
  onTabClick,
  onCloseClick,
  onEditorDidMount,
}) => {
  const theme = useTheme();
  const templateText =
    "//Selecciona uno de los archivos de la derecha para verlo y, si es posible, editarlo.\n//Select one of the files on the right to view it here and, if possible, edit it.";

  const options: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    automaticLayout: true,
  };

  return (
    <Box sx={{display: "flex", flexDirection: "column", height: "100%", width: "100%", position: "relative", overflowX: "hidden"}}>
      {tabs.length !== 0 && (
        <Box sx={{ flex: "0 0 auto" }}>
          <EditorTabs
            myTabs={tabs}
            activeTab={activeTab}
            onTabClick={onTabClick}
            onCloseClick={onCloseClick}
          />
        </Box>
      )}
      <Box sx={{ flex: "1 1 0%", minHeight: 0, width: "100%", position: "relative", border: "1px solid #ced4da", borderRadius: "4px", overflow: "hidden" }}>
        <Editor
          height="100%"
          width="100%"
          theme={theme.palette.mode === "dark" ? "vs-dark" : "vs"}
          className="editor"
          language="java"
          options={options}
          onMount={onEditorDidMount}
          onChange={onValueChange}
          defaultValue={tabs[activeTab]?.node.file?.text ?? templateText}
          path={path}
        />
      </Box>
    </Box>
  );
};
