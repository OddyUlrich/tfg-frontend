import React, { useEffect, useRef } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import { constrainedEditor } from "constrained-editor-plugin";
import { useTheme } from "@mui/material";
import { editor } from "monaco-editor";
import Button from "@mui/material/Button";

interface RangeRestrictionObject {
  range: [number, number, number, number]; // Should be a positive whole number
  allowMultiline?: boolean;
  label?: string;
  validate?: () => void;
}

interface MonacoEditorProps {
  onChange: (value: string | undefined) => void;
  textValue?: string;
  saveModel: (model: editor.ITextModel | null | undefined) => void;
  loadModel: () => editor.ITextModel | null;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  onChange,
  textValue,
  saveModel,
  loadModel,
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

  const prueba = () => {
    if (editorRef.current) {
      editorRef.current?.setModel(loadModel());
      editorRef.current?.getModel();
      //TODO editor.getModel(URI);
      //TODO editor.createModel("let a = 1;", "typescript", myUri);
    }
  };

  const options: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
  };

  return (
    <>
      <Button onClick={() => saveModel(editorRef.current?.getModel())}>
        SAVE
      </Button>
      <Button onClick={() => prueba()}>LOAD</Button>
      <Editor
        theme={theme.palette.mode === "dark" ? "vs-dark" : "vs"}
        className="editor editor-size"
        language="java"
        options={options}
        onMount={handleEditorDidMount}
        onChange={onChange}
        value={textValue}
      />
    </>
  );
};
