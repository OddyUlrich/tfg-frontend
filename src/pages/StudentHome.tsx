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
import { MyBreadcrumbs } from "../components/navigation/MyBreadcrumbs";
import { LoginContext } from "../Utils";
import { useNavigate } from "react-router-dom";

export function StudentHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [data, setData] = useState<Map<string, Exercise[]>>(new Map());
  useState<AlertColor>("success");

  const loginStatus: LoginTypes = useContext(LoginContext);
  const navigate = useNavigate();

  function refresh() {
    setIsLoading(true);
  }

  useEffect(() => {
    if (isLoading) {
      const fetchExercises = async () => {
        try {
          const response = await fetch("http://localhost:8080/exercises", {
            method: "GET",
            credentials: "include",
          });

          if (response.status === 403) {
            loginStatus.setIsLogged(false);
            navigate("/login");
            return;
          } else if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              const errorExercise: ErrorSpring = await response.json();
              setIsLoading(false);
              throw new Error("Error from backend - " + errorExercise.message);
            } else {
              setIsLoading(false);
              throw new Error("Error from backend - " + response.status);
            }
          }

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
          setGlobalError(
            "There was a problem fetching the data:\n" + error.message
          );
          console.log(
            "There was a problem fetching the data:\n" + error.message
          );
        }
        setIsLoading(false);
      };
      fetchExercises();
    }
  }, [isLoading, loginStatus, navigate]);

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

        if (response.status === 403) {
          loginStatus.setIsLogged(false);
          navigate("/login");
          return;
        } else if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorExercise: ErrorSpring = await response.json();
            throw new Error("Error from backend - " + errorExercise.message);
          } else {
            throw new Error("Error from backend - " + response.status);
          }
        }

        exercise.favorite = !exercise.favorite;
        const newMap = new Map(data);

        const exerciseList = [...(newMap.get(exercise.batteryName) ?? [])];
        exerciseList[index] = exercise;
        newMap.set(exercise.batteryName, exerciseList);

        setData(newMap);

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
        const error =
          `${exercise.name}` +
          (exercise.favorite
            ? " could not be set as favorite"
            : " could not be removed from favorites");
        console.log(error + ", " + err.message);
        enqueueSnackbar(error, {
          variant: "error",
        });
      }
    };
    updateFavorite();
  };

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
