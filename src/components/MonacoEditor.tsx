import React from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import { useTheme } from "@mui/material";
import { editor } from "monaco-editor";
import { EditorTabs, MyTab } from "./EditorTabs";

export interface RangeRestrictionObject {
  range: [number, number, number, number]; // Should be a positive whole number
  allowMultiline?: boolean;
  label?: string;
  validate?: () => void;
}

interface MonacoEditorProps {
  defaultValue: string;
  onValueChange: (value: string | undefined) => void;
  path: string;
  tabs: MyTab[];
  activeTab: number;
  onTabClick: (event: React.SyntheticEvent, index: number) => void;
  onCloseClick: (index: number) => void;
  onEditorDidMount: (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => void;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  defaultValue,
  onValueChange,
  path,
  tabs,
  activeTab,
  onTabClick,
  onCloseClick,
  onEditorDidMount,
}) => {
  const theme = useTheme();

  const options: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
  };

  return (
    <>
      {tabs.length !== 0 ? (
        <EditorTabs
          myTabs={tabs}
          activeTab={activeTab}
          onTabClick={onTabClick}
          onCloseClick={onCloseClick}
        />
      ) : null}
      <Editor
        theme={theme.palette.mode === "dark" ? "vs-dark" : "vs"}
        className="editor editor-size"
        language="java"
        options={options}
        onMount={onEditorDidMount}
        onChange={onValueChange}
        defaultValue={defaultValue}
        path={path}
      />
    </>
  );
};
