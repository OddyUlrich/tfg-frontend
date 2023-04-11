import React, { useEffect, useState } from "react";
import "../assets/styles.css";
import {
  AlertColor,
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { ExerciseTable } from "../components/ExerciseTable";
import { ErrorSpring, Exercise } from "../Types";
import { enqueueSnackbar } from "notistack";
import { Refresh } from "@mui/icons-material";

export function StudentHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [data, setData] = useState<Map<string, Exercise[]>>(new Map());
  const [favError, setFavError] = useState<string | null>(null);
  useState<AlertColor>("success");

  function refresh() {
    setIsLoading(true);
  }

  const handleFavRow = (exercise: Exercise, index: number) => {
    const updateFavorite = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/users/5/favorites/" + exercise.id,
          {
            method: "PATCH",
          }
        );

        if (!response.ok) {
          const errorPatch: ErrorSpring = await response.json();
          throw new Error("Error from backend " + errorPatch.message);
        }

        exercise.favorite = !exercise.favorite;
        const newMap = new Map(data);

        const exerciseList = [...(newMap.get(exercise.batteryName) ?? [])];
        exerciseList[index] = exercise;
        newMap.set(exercise.batteryName, exerciseList);

        setData(newMap);
        setFavError(null);

        enqueueSnackbar(
          `${exercise.name}` +
            (exercise.favorite
              ? " set as favorite"
              : " removed from favorites"),
          {
            variant: "success",
          }
        );
      } catch (err: any) {
        setFavError(
          `${exercise.name}` +
            (exercise.favorite
              ? " could not be set as favorite"
              : " could not be removed from favorites") +
            err.message
        );
        console.log(favError);
        enqueueSnackbar(
          `${exercise.name}` +
            (exercise.favorite
              ? " could not be set as favorite"
              : " could not be removed from favorites"),
          {
            variant: "error",
          }
        );
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

  let content;

  if (isLoading) {
    content = <CircularProgress />;
  } else if (globalError) {
    content = (
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
    );
  } else if (data.size === 0) {
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
      <Stack sx={{ width: "75%" }}>
        <Box justifyContent="left" display="flex">
          <IconButton color="primary" onClick={refresh}>
            <Refresh />
            <Typography marginLeft="6px"> Reload</Typography>
          </IconButton>
        </Box>
        <Card sx={{ padding: "1%" }}>
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
      </Stack>
    );
  }

  return <div className="centered-mt">{content}</div>;
}
