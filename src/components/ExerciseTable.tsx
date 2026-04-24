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
import React, { useMemo, useState } from "react";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  RadioButtonChecked,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import { ExerciseRow } from "./ExerciseRow";
import { ExerciseHome } from "../Types";
import { DateTime } from "luxon";

type ExerciseListProps = {
  batteryName: string;
  exercises: ExerciseHome[];
  onFavRow: (exercise: ExerciseHome, index: number) => void;
};

function compareCreationDate(a: ExerciseHome, b: ExerciseHome) {

  const tiempo = a.creationTimestamp.diff(b.creationTimestamp, 'milliseconds');

  if (tiempo.milliseconds > 0){
    return (-1)
  }
  if (tiempo.milliseconds < 0){
    return 1
  }

  return 0
}

function normalCompare(a: ExerciseHome, b: ExerciseHome) {

  const now = DateTime.now();

  if (now.diff(a.creationTimestamp, 'days').days < 7 || now.diff(b.creationTimestamp, 'days').days < 7){
    const comparison = compareCreationDate(a,b);

    if (comparison !== 0){
      return comparison;
    }
  }

  return a.name.localeCompare(b.name);
}

function compareExerciseByFavorite(a: ExerciseHome, b: ExerciseHome) {

  const now = DateTime.now();

  if (now.diff(a.creationTimestamp, 'days').days < 7 || now.diff(b.creationTimestamp, 'days').days < 7){
    const comparison = compareCreationDate(a,b);

    if (comparison !== 0){
      return comparison;
    }
  }

  if (a.favorite < b.favorite) {
    return 1;
  }
  if (a.favorite > b.favorite) {
    return (-1);
  }
  return a.name.localeCompare(b.name);
}

function sortData(data: ExerciseHome[], orderByFav: boolean) {
  if (orderByFav) {
    return data.sort((a, b) => compareExerciseByFavorite(a, b));
  } else {
    return data.sort((a, b) => normalCompare(a, b));
  }
}

export function ExerciseTable(props: ExerciseListProps) {
  const [open, setOpen] = useState(true);
  const [orderFav, setorderFav] = useState(false);

  const sortedData = useMemo(
    () => sortData(props.exercises, orderFav),
    [props.exercises, orderFav]
  );

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleOrder = () => {
    setorderFav(!orderFav);
  };

  const batterySection = props.batteryName?.split(" ").join("-");

  return (
    <div id={batterySection}>
      <Box display="flex">
        <Box justifyContent="left" display="flex" sx={{ flexGrow: 1 }}>
          <Typography
            marginRight="10px"
            variant="h5"
            sx={{ fontWeight: "bold" }}
          >
            {" "}
            {props.batteryName}
          </Typography>
          <IconButton sx={{ border: 0 }} onClick={handleOpen}>
            {open ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
          </IconButton>
        </Box>
        <IconButton sx={{ border: 0 }} onClick={handleOrder} color="primary">
          <Typography marginRight="10px">Favorites First</Typography>
          {orderFav ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
        </IconButton>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <TableContainer component={Paper}>
          <Table aria-label="exercises">
            <TableBody>
              {sortedData.map((row: ExerciseHome, index) => (
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
