import React, { useContext, useEffect, useState } from "react";
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
import { ErrorSpring, Exercise, LoginTypes } from "../Types";
import { enqueueSnackbar } from "notistack";
import { Refresh } from "@mui/icons-material";
import { MyBreadcrumbs } from "../components/MyBreadcrumbs";
import { handleCheckStatus, LoginContext } from "../Utils";
import { NavigateFunction, useNavigate } from "react-router-dom";

async function checkResponseError(
  response: Response,
  navigate: NavigateFunction,
  loginStatus: LoginTypes
) {
  if (
    !response.ok &&
    !handleCheckStatus(response.status, navigate, loginStatus)
  ) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const errorExercise: ErrorSpring = await response.json();
      throw new Error("Error from backend - " + errorExercise.message);
    } else {
      throw new Error("Error from backend - " + response.status);
    }
  }
}

export function StudentHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [data, setData] = useState<Map<string, Exercise[]>>(new Map());
  const [favError, setFavError] = useState<string | null>(null);
  useState<AlertColor>("success");

  const loginStatus: LoginTypes = useContext(LoginContext);
  const navigate = useNavigate();

  function refresh() {
    setIsLoading(true);
  }

  const handleFavRow = (exercise: Exercise, index: number) => {
    const updateFavorite = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/users/favorites/" + exercise.id,
          {
            method: "PATCH",
            credentials: "include",
          }
        );

        await checkResponseError(response, navigate, loginStatus);

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
            credentials: "include",
          });

          await checkResponseError(response, navigate, loginStatus);

          const exercises: Exercise[] = await response.json();

          const batteries = new Map<string, Exercise[]>(
            exercises.map((exercise) => [exercise.batteryName, []])
          );

          exercises.forEach((exercise) => {
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
  }, [isLoading, loginStatus, navigate]);

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

  return (
    <>
      <MyBreadcrumbs />
      <div className="centered-mt">{content}</div>
    </>
  );
}
