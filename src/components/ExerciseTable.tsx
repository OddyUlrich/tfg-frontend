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
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { ExerciseRow } from "./ExerciseRow";
import { Exercise } from "../Types";

type ExerciseListProps = {
  batteryName: string;
  exercises: Exercise[];
  onFavRow: (exercise: Exercise, index: number) => void;
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
          {props.batteryName}
        </Typography>
        <IconButton sx={{ border: 0 }} onClick={handleOpen}>
          {open ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
        </IconButton>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <TableContainer component={Paper}>
          <Table aria-label="exercises">
            <TableBody>
              {props.exercises.map((row: Exercise, index) => (
                <ExerciseRow
                  key={row.name}
                  exercise={row}
                  onFav={() => props.onFavRow(row, index)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </div>
  );
}
