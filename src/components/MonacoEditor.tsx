import React, { useEffect, useRef } from "react";

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

interface MonacoEditorProps {
  onChange: (value: string) => void;
  textValue?: string;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  onChange,
  textValue,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const restrictions: RangeRestrictionObject[] = [];
  const theme = useTheme();

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

  const options: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.onDidChangeModelContent(() => {
        if (editorRef.current) {
          const editorValue = editorRef.current.getValue();
          onChange(editorValue); // Notifica al padre sobre el cambio
        }
      });
    }
  }, [onChange]);

  return (
    <Editor
      theme={theme.palette.mode === "dark" ? "vs-dark" : "vs"}
      className="editor editor-size"
      language="java"
      value={textValue}
      options={options}
      onMount={handleEditorDidMount}
    />
  );
};
