import React, { useRef } from "react";

import Editor from "@monaco-editor/react";
import { constrainedEditor } from "constrained-editor-plugin";
import { useLocation } from "react-router-dom";
import { Box } from "@mui/material";

interface RangeRestrictionObject {
  range: [number, number, number, number]; // Should be a positive whole number
  allowMultiline?: boolean;
  label?: string;
  validate?: () => void;
}

export function MonacoEditor() {
  const editorRef = useRef(null);
  const restrictions: RangeRestrictionObject[] = [];
  const location = useLocation();

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
    const constrainedInstance = constrainedEditor(monaco);
    const model = editor.getModel();
    constrainedInstance.initializeIn(editor);
    // restrictions.push({
    //   range: [1, 1, 2, 10],
    //   allowMultiline: true,
    // });
    // constrainedInstance.addRestrictionsTo(model, restrictions);
    console.log(location.pathname);
  }

  return (
    <Box className="flex-editor">
      <Editor
        className="editor"
        width="50%"
        height="85vh"
        onMount={handleEditorDidMount}
      />
    </Box>
  );
}
