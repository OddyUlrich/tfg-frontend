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
} from "@mui/material";
import React, { useState } from "react";
import { Exercise, Tag } from "../pages/Home";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

type ExerciseListProps = {
  data: Map<string, Exercise[]>;
};

export function ExerciseList(props: ExerciseListProps) {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      {Array.from(props.data.keys()).map((battery: string) => (
        <div key={battery}>
          <h2>{battery}</h2>
          <Box justifyContent="center" display="flex">
            <IconButton sx={{ border: 0 }} onClick={handleClick}>
              {open ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
            </IconButton>
          </Box>

          <Collapse in={open} timeout="auto" unmountOnExit>
            <TableContainer component={Paper}>
              <Table aria-label="exercises">
                <TableBody>
                  {props.data.get(battery)?.map((row: Exercise) => (
                    <TableRow
                      key={row.name}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.name}
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
                        {row.numberErrorsSolution}
                      </TableCell>
                      <TableCell align="right">{row.statusSolution}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Collapse>
        </div>
      ))}
    </>
  );
}
