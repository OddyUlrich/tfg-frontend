import React, { useContext, useEffect, useState } from "react";
import "../assets/styles.css";
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton, InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import { ExerciseTable } from "../components/ExerciseTable";
import { ErrorSpring, ExerciseHome, LoginTypes, Tag } from "../Types";
import { enqueueSnackbar } from "notistack";
import { MyBreadcrumbs } from "../components/navigation/MyBreadcrumbs";
import { LoginContext, useErrorHandler } from "../Utils";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import { Link } from "../components/navigation/Link";
import TextField from "@mui/material/TextField";
import { Refresh, Search } from "@mui/icons-material";

export function StudentHome() {

  const errorHandler = useErrorHandler();

  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [data, setData] = useState<Map<string, ExerciseHome[]>>(new Map());

  const [allTags, setAllTags] = useState<Tag[]>([]);

  const [filterExerciseName, setFilterExerciseName] = useState("");
  const [filterBatteryName, setFilterBatteryName] = useState("");
  const [filterTags, setFilterTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const loginStatus: LoginTypes = useContext(LoginContext);
  const navigate = useNavigate();

  function refresh() {
    setIsLoading(true);
  }

  useEffect(() => {

    const fetchTags = async () => {
      setIsLoadingTags(true);
      try {
        const responseTags = await fetch(
          "http://localhost:8080/tags",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
          }
        );

        await errorHandler(responseTags);

        const tags: Tag[] = await responseTags.json();
        setAllTags(tags);

      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.log("Network error: " + error.message);
        }
      } finally{
        setIsLoadingTags(false);
      }
    };

    void fetchTags();

  }, []);

  //DEBOUNCE TO AVOID SEVERAL PETITIONS EVERY TIME THE USER WRITES
  useEffect(() => {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      void fetchExercises(controller.signal);
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [filterExerciseName, filterBatteryName, filterTags, isLoading]);

  const fetchExercises = async (signal?: AbortSignal) => {
    try {

      const params = new URLSearchParams();

      if (filterExerciseName) params.append("exerciseName", filterExerciseName);
      if (filterBatteryName) params.append("batteryName", filterBatteryName);
      if (filterTags.length > 0) params.append("tags", filterTags.map(t => t.name).join(","));


      const response = await fetch(`http://localhost:8080/exercises?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
        signal,
      });

      await errorHandler(response);

      const exercises: ExerciseHome[] = await response.json();

      const batteries = new Map<string, ExerciseHome[]>(
        exercises.map((exercise) => [exercise.batteryName, []])
      );

      exercises.forEach((exercise) => {
        //The automatic parse doesn't know this is a DateTime, so it just parses it as String, so I parse it myself
        const creationDate = exercise.creationTimestamp.toString();
        exercise.creationTimestamp = DateTime.fromISO(creationDate);

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


  const handleFavRow = (exercise: ExerciseHome, index: number) => {
    const updateFavorite = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/users/favorites/" + exercise.id,
          {
            method: "PATCH",
            credentials: "include",
          }
        );

        if (response.status === 401) {
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
    void updateFavorite();
  };

  let content;

  if (isLoading) {
    content = <CircularProgress/>;
  } else if (globalError) {
    content = (
      <Card
        sx={{
          width: "40%",
          margin: "auto",
        }}
      >
        <CardContent>
          <Typography>{globalError}</Typography>
        </CardContent>
      </Card>
    );
  } else {
    content = (
      <Card sx={{ width: "100%", padding: "1%" }}>
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
    <>
      <MyBreadcrumbs />

      <Box className="centered-mt">
        <Stack sx={{ width: "75%" }}>
          <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
            <Box justifyContent="left" display="flex" sx={{ flexGrow: 1 }}>
              <IconButton color="primary" onClick={refresh}>
                <Refresh />
                <Typography marginLeft="6px"> Reload</Typography>
              </IconButton>
            </Box>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ flexGrow: 1, mx: 2 }}
            >
              <TextField
                size="small"
                placeholder="Exercise name"
                value={filterExerciseName}
                onChange={(e) => setFilterExerciseName(e.target.value)}
                slotProps={{
                  input:{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                }
                sx={{ minWidth: 160 }}
              />
              <TextField
                size="small"
                placeholder="Battery name…"
                value={filterBatteryName}
                onChange={(e) => setFilterBatteryName(e.target.value)}
                slotProps={{
                  input:{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                }
                sx={{ minWidth: 160 }}
              />
              <Autocomplete
                sx={{
                  minWidth: 200,
                  maxWidth: 400,
                  "& .MuiAutocomplete-inputRoot": {
                    maxHeight: 100,
                    overflowY: "auto",
                    alignItems: "flex-start",
                  },
                }}

                multiple
                size="small"
                options={allTags}
                value={filterTags}
                loading={isLoadingTags}
                limitTags={3}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.name === value.name}
                slotProps={{
                  chip: {
                    size: "small",
                  },
                }}
                onChange={(_, newValue) => setFilterTags(newValue)}
                renderInput={(params) => (
                  <TextField {...params} placeholder={filterTags.length === 0 ? "Tags…" : ""} />
                )}
                noOptionsText="No tags found"
              />
            </Stack>

            <Box sx={{marginBottom: 1}} justifyContent="right" display="flex">
              <IconButton
                component={Link}
                to="/exercises/new"
                color="primary"
                size="small"
                sx={{
                  border: "1px solid",
                  borderColor: "primary.main",
                  borderRadius: "8px",
                  padding: "6px 12px",
                }}
              >
                <Typography variant="button" color="primary">
                  New Exercise
                </Typography>
              </IconButton>
            </Box>
          </Box>
          <Box sx={{
            display: "flex",
            justifyContent: "center",
            whiteSpace: "pre-line",
            mt: "25px",
          }}>
            {content}
          </Box>
        </Stack>
      </Box>



    </>
  );
}
