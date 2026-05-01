import React from "react";
import { Box, TextField, Button, IconButton, Tooltip } from "@mui/material";
import { ExpandableChip } from "./ExpandableChip";
import { Info } from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import FileSelector from "./FileSelector";

export default function MethodsEditor({
                                methods,
                                setMethods,
                                fileNames,
                              }: {
  fileNames: string[];
  methods: string[];
  setMethods: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [methodName, setMethodName] = React.useState("");
  const [fileName, setFilename] = React.useState("");

  const addMethod = () => {
    const trimmed = methodName.trim();
    if (!trimmed) return;

    if (!methods.includes(trimmed)) {
      setMethods([...methods, trimmed]);
    }

    setMethodName("");
  };

  return (
    <Box>
      {/* TITLE */}
      <Box sx={{ display: "flex", gap: 1, mb: 1}}>
        <Typography variant="h6" >
          Métodos editables
        </Typography>
        <Tooltip title="Los métodos que quieras que el alumno pueda editar. Defínelos, sin necesidad de argumentos. Ej.: public static void main"
                 slotProps={{
                   tooltip: {
                     sx: {
                       fontSize: "1rem",
                       maxWidth: 500
                     }
                   }
                 }}>
          <IconButton size="small">
            <Info color="action" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* INPUT */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <FileSelector fileNames={fileNames} value={fileName} onChange={setFilename} />
        <TextField
          size="small"
          fullWidth
          label="Añadir método editable"
          value={methodName}
          onChange={(e) => setMethodName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addMethod();
            }
          }}
        />


        <Button variant="contained" onClick={addMethod}>
          Añadir
        </Button>
      </Box>

      {/* CHIPS */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        {methods.map((m) => (
          <ExpandableChip
            key={m}
            name={m}
            onRemove={() =>
              setMethods((prev) => prev.filter((x) => x !== m))
            }
          />
        ))}
      </Box>
    </Box>
  );
}