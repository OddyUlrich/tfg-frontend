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
    "//Selecciona uno de los archivos de la derecha para verlo y, si es posible, editarlo.\n//Select one of the files on the right to view it here and, if possible, edit it.\n";

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
        className="editor"
        language="java"
        options={options}
        onMount={onEditorDidMount}
        onChange={onValueChange}
        defaultValue={tabs[activeTab]?.node.file?.content ?? templateText}
        path={path}
      />
    </>
  );
};
