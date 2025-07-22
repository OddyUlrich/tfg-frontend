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

export const AddBatteryDialog: React.FC<AlertDialogProps> = ({
                                                          open,
                                                          handleClose,
                                                        }) => {

  const [batteryName, setBatteryName] = React.useState("");


  useEffect(() => {
    if (!open) {
      setBatteryName("");
    }
  }, [open]);


  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="alert-dialog-title">
          {"Añadir nueva batería"}
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Qué batería quieres añadir?
          </DialogContentText>
          <TextField
            sx={{ marginTop: 4, width: "100%" }}
            margin="normal"
            variant={"outlined"}
            required
            fullWidth
            id="batteryName"
            label="Name"
            name="batteryName"
            autoComplete="batteryName"
            autoFocus
            value={batteryName}
            onChange={(e) => setBatteryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button onClick={() => handleClose(true, batteryName)} autoFocus>
            Añadir
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};