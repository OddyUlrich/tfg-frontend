import React, { useEffect, useState } from "react";
import "../assets/styles.css";
import {
  AlertColor,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { ExerciseTable } from "../components/ExerciseTable";
import { MySnackbar } from "../components/MySnackbar";
import { ErrorSpring, Exercise } from "../Types";

export function StudentHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [favError, setFavError] = useState<string | null>(null);
  const [snackbarText, setSnackbarText] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<AlertColor>("success");
  const [data, setData] = useState<Map<string, Exercise[]>>(new Map());

  const handleCloseSnackbar = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false);
  };

  const handleFavRow = (exercise: Exercise, index: number) => {
    const updateFavorite = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/users/5/favorites/" + exercise.id,
          {
            method: "PUT",
          }
        );

        if (!response.ok) {
          const errorPatch: ErrorSpring = await response.json();
          throw new Error("Error from backend " + errorPatch.message);
        }

        exercise.favorite = !exercise.favorite;
        const newMap = new Map(data);

        const exerciseList = newMap.get(exercise.batteryName) ?? [];
        exerciseList[index] = exercise;

        setData(newMap);
        setFavError(null);

        setSnackbarText(`${exercise.name} set as favorite`);
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
      } catch (err: any) {
        setFavError(
          `${exercise.name} could not be set as a favorite:\n` + err.message
        );
        console.log(favError);
        setSnackbarText(`${exercise.name} could not be set as a favorite`);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    };
    updateFavorite();
  };

  useEffect(() => {
    if (isLoading) {
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:8080/exercises", {
            method: "GET",
          });

          if (!response.ok) {
            const errorPatch: ErrorSpring = await response.json();
            throw new Error("Error from backend - " + errorPatch.message);
          }

          const data: Exercise[] = await response.json();

          const batteries = new Map<string, Exercise[]>(
            data.map((exercise) => [exercise.batteryName, []])
          );

          data.forEach((exercise) => {
            batteries.get(exercise.batteryName)?.push(exercise);
          });

          setData(batteries);
          setGlobalError(null);
        } catch (error: any) {
          setIsLoading(false);
          setGlobalError(
            "There was a problem fetching the data:\n" + error.message
          );
        }
        setIsLoading(false);
      };
      fetchData();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <Box className="flex-center" marginTop="50px">
        <CircularProgress />
      </Box>
    );
  }

  if (globalError) {
    return (
      <div className="centered-mt">
        <Card
          className="flex-center"
          sx={{
            width: "40%",
          }}
        >
          <CardContent>
            <Typography>{globalError}</Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  let content;
  if (data.size === 0) {
    const txt = "There is no exercises yet!\nAsk Penin ᕕ(⌐■_■)ᕗ ♪♬";
    content = (
      <>
        <Typography whiteSpace="pre-line" variant="h5">
          {txt}
        </Typography>
      </>
    );
  } else {
    content = (
      <Card sx={{ width: "75%", padding: "1%" }}>
        <CardContent>
          <Stack spacing={10} direction="column">
            {Array.from(data.keys()).map((battery) => (
              <ExerciseTable
                key={battery}
                batteryName={battery}
                exercises={data.get(battery) ?? []}
                onFavRow={handleFavRow}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="centered-mt">
      {content}
      <MySnackbar
        open={openSnackbar}
        severity={snackbarSeverity}
        message={snackbarText}
        handleClose={handleCloseSnackbar}
      />
    </div>
  );
}
