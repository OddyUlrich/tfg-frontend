import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import SendIcon from "@mui/icons-material/Send";
import Typography from "@mui/material/Typography";
import { enqueueSnackbar } from "notistack";

export function MyDropzone() {

  const [openDialog, setOpenDialog] = React.useState(false);
  const [droppedFiles, setDroppedFiles] = React.useState<File[]>([]);
  const [selectedFolder, setSelectedFolder] = React.useState<string | null>(null);

  const accept = useCallback((acceptedFiles: File[]) => {
    console.log("acceptedFiles", acceptedFiles);
  }, []);

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
    onDrop: accept
  });

  const handleSubmit = () => {
    //No se
  };

  useEffect(() => {
    if (acceptedFiles.length === 1) {
      enqueueSnackbar("Se ha subido el archivo correctamente", {
        variant: "success",
      });
    }
  }, [acceptedFiles]);

  useEffect(() => {
    if (fileRejections.length >= 1) {
      enqueueSnackbar("No se puede subir más de 1 archivo .zip", {
        variant: "error",
      });
    }
  }, [fileRejections]);

  //Prueba

  const acceptedFileMessage = acceptedFiles.map(file => (
    <>
      <li key={file.path}>
        {file.path} - {(file.size / 1048576).toFixed(1)} MB
      </li>
    </>
  ));

  const fileRejectionMessage = fileRejections.length > 0 ? (
    <p style={{ color: '#ff6666' }}>Solo un archivo en extensión .zip</p>
  ) : null;


  //Final branch

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
            <p>Suelta el archivo .zip aqui</p> :
            <Box>
              <p style={{ whiteSpace: "pre-line" }}>
                Arrastra y suelta el archivo .zip aquí o haz clic para seleccionar
                {"\n"}El .zip debe contener todos los ficheros del ejercicio
              </p>
              <p>Máximo 16 MB</p>
            </Box>
        }
        <aside>
          <ul>{acceptedFileMessage}</ul>
          {fileRejectionMessage}
        </aside>
      </Box>


      <Button
        sx={{ marginTop: 2, marginBottom: 0 }}
        startIcon={<FolderZipIcon />}
        onClick={handleSubmit}
        color="success"
        variant="contained"
        endIcon={<SendIcon />}
      >
        <Typography variant="button">
          <strong>Subir archivos</strong>
        </Typography>
      </Button>
    </>
  );
}