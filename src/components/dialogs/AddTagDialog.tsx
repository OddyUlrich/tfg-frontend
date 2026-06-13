import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useEffect } from "react";

interface AlertDialogProps {
  open: boolean;
  handleClose: (confirmed: boolean, inputValue?: string) => void;
}

export const AddTagDialog: React.FC<AlertDialogProps> = ({open, handleClose}) => {

  const [tagName, setTagName] = React.useState("");

  useEffect(() => {
    if (!open) {
      setTagName("");
    }
  }, [open]);


  return (
    <div>
      <Dialog
        open={open}
        onClose={(_, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            handleClose(false);
          }
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="alert-dialog-title">
          {"Añadir nueva etiqueta"}
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Qué etiqueta quieres añadir?
          </DialogContentText>
          <TextField
            sx={{ marginTop: 4, width: "100%" }}
            margin="normal"
            variant={"outlined"}
            required
            fullWidth
            id="tagName"
            label="Name"
            name="tagName"
            autoComplete="tagName"
            autoFocus
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button onClick={() => handleClose(true, tagName)} autoFocus>
            Añadir
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};