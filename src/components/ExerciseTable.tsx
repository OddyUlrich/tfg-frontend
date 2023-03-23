import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableContainer,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Exercise, ExerciseBattery } from "../pages/Home";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { ExerciseRow } from "./ExerciseRow";

type ExerciseListProps = {
  data: ExerciseBattery;
  onFavRow: (exercise: Exercise) => void;
};

export function ExerciseTable(props: ExerciseListProps) {
  const [open, setOpen] = useState(true);

  const handleOpen = () => {
    setOpen(!open);
  };

  return (
    <div>
      <Box justifyContent="left" display="flex">
        <Typography marginRight="10px" variant="h5" sx={{ fontWeight: "bold" }}>
          {" "}
          {props.data.batteryName}
        </Typography>
        <IconButton sx={{ border: 0 }} onClick={handleOpen}>
          {open ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
        </IconButton>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <TableContainer component={Paper}>
          <Table aria-label="exercises">
            <TableBody>
              {props.data.exercises.map((row: Exercise) => (
                <ExerciseRow exercise={row} onFav={props.onFavRow} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </div>
  );
}
