import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Stack } from "@mui/material";
import { ExerciseList } from "../components/ExerciseList";

export type Tag = {
  name: string;
};

export type Exercise = {
  name: string;
  tags: Tag[];
  batteryName: string;
  numberErrorsSolution: number;
  statusSolution: string;
};

//https://mui.com/material-ui/react-progress/ lo del valor anterior
//Siguiente paso: el collapse ---> mandar algo de vuelta al backend

export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Map<string, Exercise[]>>(new Map());

  useEffect(() => {
    if (isLoading) {
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:8080/exercises", {
            method: "GET",
          });
          if (response.ok) {
            const data: Exercise[] = await response.json();
            const ejercicios = new Map<string, Exercise[]>();

            for (const e of data) {
              if (ejercicios.has(e.batteryName)) {
                const valor = ejercicios.get(e.batteryName);
                if (valor !== undefined) {
                  valor.push(e);
                }
              } else {
                ejercicios.set(e.batteryName, [e]);
              }
            }

            setData(ejercicios);

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
    <Stack spacing={2} direction="column">
      <ExerciseList data={data} />
    </Stack>
  );
}
