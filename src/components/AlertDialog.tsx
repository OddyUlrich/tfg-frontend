import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

interface AlertDialogProps {
  open: boolean;
  handleClose: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  handleClose,
}) => {
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Save before closing?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to save the file before closing it?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>No, don't save</Button>
          <Button onClick={handleClose} autoFocus>
            Yes, Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
