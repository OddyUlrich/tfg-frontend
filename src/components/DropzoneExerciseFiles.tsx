import React, { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Box } from "@mui/material";
import { enqueueSnackbar } from "notistack";

type DropzoneProps = {
  handleDrop: (acceptedFiles: File[]) => void;
}

export function DropzoneExerciseFiles({handleDrop}: DropzoneProps) {

  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    maxFiles: 1,
    accept: {
      "application/zip": [".zip"],
      "application/7ZIP": [".7z"]
    },
    onDropAccepted: handleDrop
  });

  useEffect(() => {
    if (acceptedFiles.length === 1) {
      enqueueSnackbar("Se ha subido el archivo correctamente", {
        variant: "success"
      });
    }
  }, [acceptedFiles]);

  useEffect(() => {
    if (fileRejections.length >= 1) {
      enqueueSnackbar("Solo se puede subir un único archivo .zip", {
        variant: "error"
      });
    }
  }, [fileRejections]);

  const acceptedFileMessage = (
    <ul>
      {acceptedFiles.map(file => (
      <li key={file.path}>
        <p style={{ color: "#4caf50" }}>{file.path} - {(file.size / 1048576).toFixed(1)} MB</p>
      </li>
      ))}
    </ul>
  );


  const fileRejectionMessage = fileRejections.length > 0 ? (
    <p style={{ color: "#ff6666" }}>Solo un archivo en extensión .zip</p>
  ) : null;

  return (
    <>
      <Box width={500}
           {...getRootProps()}
           sx={{
             border: "2px dashed #ccc",
             borderRadius: 2,
             paddingX: 2,
             paddingY: 1,
             marginTop: 4,
             color: "#888",
             cursor: "pointer",
             transition: "border 0.3s",
             "&:hover": {
               borderColor: "#1976d2"
             }
           }}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <> <p>Suelta el archivo .zip aqui</p> <br/> <br/> </>:
            <Box>
              <p style={{ whiteSpace: "pre-line" }}>
                Arrastra y suelta el archivo .zip aquí o haz clic para seleccionar
                {"\n"}El .zip debe contener todos los ficheros del ejercicio
                {"\n"}En el .zip solo debería haber ficheros .java, .txt o .md
              </p>
              <p>Máximo 16 MB</p>
            </Box>
        }
          {acceptedFileMessage}
          {fileRejectionMessage}
      </Box>
    </>
  );
}