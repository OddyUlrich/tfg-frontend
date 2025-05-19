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
import { Exercise } from "../Types";
import { DateTime } from "luxon";

type ExerciseListProps = {
  batteryName: string;
  exercises: Exercise[];
  onFavRow: (exercise: Exercise, index: number) => void;
};

function compareCreationDate(a: Exercise, b: Exercise) {

  if (DateTime.now().diff(a.creationTimestamp, 'days').days < 7) {
    return -1;
  }
  if (DateTime.now().diff(b.creationTimestamp, 'days').days < 7) {
    return 1;
  }

  return 0;
}

function normalCompare(a: Exercise, b: Exercise) {

  const orderNew = compareCreationDate(a,b);

  if (orderNew !== 0) {
    return orderNew;
  }

  return a.name.localeCompare(b.name);
}

function compareExerciseByFavorite(a: Exercise, b: Exercise) {

  const orderNew = compareCreationDate(a,b);

  if (orderNew !== 0) {
    return orderNew;
  }

  if (a.favorite < b.favorite) {
    return 1;
  }
  if (a.favorite > b.favorite) {
    return -1;
  }
  return a.name.localeCompare(b.name);
}

/*TODO poner que en el comparar normal una función donde salgan de primero los
   ejercicios con tiempo inferior a 7 días desde su creación, si no es el caso
   entonces simplemente salen por orden alfabético, normal.*/

function sortData(data: Exercise[], order: boolean) {
  if (order) {
    return data.sort((a, b) => compareExerciseByFavorite(a, b));
  } else {
    return data.sort((a, b) => normalCompare(a, b));
  }
}

export function ExerciseTable(props: ExerciseListProps) {
  const [open, setOpen] = useState(true);
  const [orderFav, setOrderFav] = useState(false);

  const sortedData = useMemo(
    () => sortData(props.exercises, orderFav),
    [props.exercises, orderFav]
  );

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleOrder = () => {
    setOrderFav(!orderFav);
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
              {sortedData.map((row: Exercise, index) => (
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
