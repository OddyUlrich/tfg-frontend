import {
  Chip,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { Exercise, Tag } from "../pages/Home";
import { Star, StarBorder } from "@mui/icons-material";
import React from "react";

type ExerciseRowProps = {
  exercise: Exercise;
  onFav: (exercise: Exercise) => void;
};

export function ExerciseRow(props: ExerciseRowProps) {
  return (
    <TableRow
      key={props.exercise.name}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
    >
      <TableCell component="th" scope="row">
        <Typography variant="h6">{props.exercise.name}</Typography>
      </TableCell>
      <TableCell align="center">
        {props.exercise.tags.map((tag: Tag) => (
          <Chip
            key={tag.name}
            label={tag.name}
            sx={{
              border: 0,
              marginLeft: "5px",
              fontWeight: "bold",
            }}
          />
        ))}
      </TableCell>
      <TableCell align="center">
        <IconButton
          sx={{ border: 0 }}
          onClick={() => props.onFav(props.exercise)}
        >
          {props.exercise.favorite ? <Star /> : <StarBorder />}
        </IconButton>
      </TableCell>
      <TableCell align="right">{props.exercise.statusSolution}</TableCell>
    </TableRow>
  );
}
