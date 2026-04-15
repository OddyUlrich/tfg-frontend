import { Box, Chip, IconButton, TableCell, TableRow } from "@mui/material";
import { Star, StarBorder, NewReleases, ModeEdit } from "@mui/icons-material";
import React from "react";
import { Exercise, Tag } from "../Types";
import { yellow } from "@mui/material/colors";
import { Link } from "./navigation/Link";
import { DateTime } from "luxon";

type ExerciseRowProps = {
  exercise: Exercise;
  onFav: () => void;
};



export function ExerciseRow(props: ExerciseRowProps) {

  let content = null;

  if (DateTime.now().diff(props.exercise.creationTimestamp, 'days').days < 7) {
    content = <NewReleases sx={{ verticalAlign: 'middle' }} color={"primary"}/>
  }

  return (
    <TableRow
      key={props.exercise.name}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
    >
      <TableCell width="30%" component="th" scope="row">
        <Link
          underline="hover"
          variant="h6"
          color="inherit"
          to={{
            pathname: `/exercises/${props.exercise.id}`
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {props.exercise.name}
            {content}
          </Box>
        </Link>
      </TableCell>
      <TableCell width="30%" align="center">
        {props.exercise.tags.map((tag: Tag) => (
          <Chip
            key={tag.name}
            label={tag.name}
            sx={{
              border: 0,
              marginLeft: "5px",
              fontWeight: "bold"
            }}
          />
        ))}
      </TableCell>
      <TableCell width="10%" align="center">
        <IconButton sx={{ border: 0 }} onClick={props.onFav}>
          {props.exercise.favorite ? (
            <Star sx={{ color: yellow["800"] }} />
          ) : (
            <StarBorder />
          )}
        </IconButton>
      </TableCell>
      <TableCell width="10%" align="center">
        <IconButton component={Link} to={{ pathname: `/exercises/edit/${props.exercise.id}` }}>
          <ModeEdit fontSize="medium" />
        </IconButton>
      </TableCell>
      <TableCell width="10%" align="right">{props.exercise.statusSolution}</TableCell>
    </TableRow>
  );
}
