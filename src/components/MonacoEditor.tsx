import React, { useRef } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import { constrainedEditor } from "constrained-editor-plugin";
import { useTheme } from "@mui/material";
import { editor } from "monaco-editor";

interface RangeRestrictionObject {
  range: [number, number, number, number]; // Should be a positive whole number
  allowMultiline?: boolean;
  label?: string;
  validate?: () => void;
}

export function MonacoEditor() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const restrictions: RangeRestrictionObject[] = [];
  const theme = useTheme();

  const options: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
  };

  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    editorRef.current = editor;

    const constrainedInstance = constrainedEditor(monaco);
    const model = editor.getModel();

    constrainedInstance.initializeIn(editor);
    // restrictions.push({
    //   range: [1, 1, 2, 10],
    //   allowMultiline: true,
    // });
    // constrainedInstance.addRestrictionsTo(model, restrictions);
  }

  return (
    <Editor
      theme={theme.palette.mode === "dark" ? "vs-dark" : "vs"}
      className="editor editor-size"
      language="java"
      options={options}
      onMount={handleEditorDidMount}
    />
  );
}
