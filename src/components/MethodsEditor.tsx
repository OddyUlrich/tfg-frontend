import React from "react";
import { Box, TextField, Button, IconButton, Tooltip } from "@mui/material";
import { ExpandableChip } from "./ExpandableChip";
import { Info } from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import FileSelector from "./FileSelector";
import { EditableMethod, ExerciseFile } from "../Types";
import { enqueueSnackbar } from "notistack";

export default function MethodsEditor({
                                filenames,
                                templateFiles,
                                setTemplateFiles,

                              }: {
  filenames: string[];
  templateFiles: ExerciseFile[];
  setTemplateFiles: React.Dispatch<React.SetStateAction<ExerciseFile[]>>;
}) {

  const [methodName, setMethodName] = React.useState("");
  const [filename, setFilename] = React.useState("");

  const addMethod = () => {
    const trimmedName = methodName.trim();
    const trimmedFilename = filename.trim();

    if (!trimmedName || !trimmedFilename) return;

    setTemplateFiles(prevFiles => {
      return prevFiles.map(file => {
        if (file.name !== trimmedFilename) return file;

        const fileMethods  = file.editableMethods ?? [];

        const exists = fileMethods.some(m => m.name === trimmedName);

        if (exists) {
          enqueueSnackbar(
            "Ya existe un método con ese nombre en el mismo fichero",
            { variant: "error" }
          );
          return file;
        }

        const newMethod: EditableMethod = {
          name: trimmedName,
          line: -1,
        };

          return {
          ...file,
          editableMethods: [...fileMethods, newMethod],
        };
      });
    });
    setMethodName("");
  }

  const methods = React.useMemo(() =>
    templateFiles.flatMap(file =>
      (file.editableMethods ?? []).map(method => ({
        ...method,
        filename: file.name
      }))
    ),
    [templateFiles]
  );

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
        <FileSelector filenames={filenames} value={filename} onChange={setFilename} />
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
            key={m.name}
            name={m.name}
            filename={m.filename}
            onRemove={() =>
              methods.filter((x) => x !== m)
            }
          />
        ))}
      </Box>
    </Box>
  );
}