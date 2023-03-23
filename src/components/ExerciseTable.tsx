import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Exercise, ExerciseBattery, Tag } from "../pages/Home";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Star,
  StarBorder,
} from "@mui/icons-material";

type ExerciseListProps = {
  data: ExerciseBattery;
};

export function ExerciseTable(props: ExerciseListProps) {
  const [open, setOpen] = useState(true);
  const [fav, setFav] = useState(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleFav = () => {
    setFav(!fav);
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
                <TableRow
                  key={row.name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="h6">{row.name}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    {row.tags.map((tag: Tag) => (
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
                    <IconButton sx={{ border: 0 }} onClick={handleFav}>
                      {fav ? <Star /> : <StarBorder />}
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">{row.statusSolution}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </div>
  );
}
