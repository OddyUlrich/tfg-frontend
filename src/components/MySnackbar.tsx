import React, { useRef } from "react";
import {
  Alert,
  AlertColor,
  IconButton,
  Snackbar,
  SnackbarProps,
} from "@mui/material";
import { Close } from "@mui/icons-material";

export interface MySnackbarProps extends SnackbarProps {
  severity?: AlertColor;
  handleClose: (event: React.SyntheticEvent | Event, reason?: string) => void;
}

export function MySnackbar(props: MySnackbarProps) {
  //TODO revisar ese hook para cambiar el timer del snackbar cuando se crea uno nuevo
  //const timerRef = useRef();

  const action = (
    <>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={props.handleClose}
      >
        <Close fontSize="small" />
      </IconButton>
    </>
  );

  return (
    <div>
      <Snackbar
        anchorOrigin={props.anchorOrigin}
        open={props.open}
        autoHideDuration={6000}
        onClose={props.handleClose}
        action={action}
      >
        <Alert onClose={props.handleClose} severity={props.severity}>
          {props.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
