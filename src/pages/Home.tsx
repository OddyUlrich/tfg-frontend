import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, CircularProgress, Stack } from "@mui/material";
import { ExerciseTable } from "../components/ExerciseTable";

export type Tag = {
  name: string;
};

export type Exercise = {
  name: string;
  tags: Tag[];
  favorite: boolean;
  batteryName: string;
  numberErrorsSolution: number;
  statusSolution: string;
};

export type ExerciseBattery = {
  batteryName: string;
  exercises: Exercise[];
};

export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExerciseBattery[]>([]);

  const handleFavRow = (exercise: Exercise) => {
    console.log("ey");
  };

  useEffect(() => {
    if (isLoading) {
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:8080/exercises", {
            method: "GET",
          });

          if (response.ok) {
            const data: Exercise[] = await response.json();
            const batteries: ExerciseBattery[] = [];

            for (const exercise of data) {
              const battery = batteries.find(
                (battery) => battery.batteryName === exercise.batteryName
              );
              if (battery === undefined) {
                const newBattery: ExerciseBattery = {
                  batteryName: exercise.batteryName,
                  exercises: [exercise],
                };
                batteries.push(newBattery);
              } else {
                battery.exercises.push(exercise);
              }
            }
            // Hashmap -> String/Exercises[] ->

            setData(batteries);
            setError(null);
          } else {
            setError("Hubo un error al obtener los datos");
          }
        } catch (error: any) {
          setError("Hubo un problema con la petición Fetch:" + error.message);
        }
        setIsLoading(false);
      };
      fetchData();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        sx={{
          alignItems: "center",
          marginTop: "50px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Card sx={{ width: "75%", marginTop: "50px", padding: "1%" }}>
        <CardContent>
          <Stack spacing={10} direction="column">
            {data.map((battery) => (
              <ExerciseTable
                key={battery.batteryName}
                data={battery}
                onFavRow={handleFavRow}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}
