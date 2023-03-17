import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";

type MyType = {
  name: string;
  tags: string;
  numberErrorsSolution: number;
  statusSolution: string;
};

{
  //Obtener los datos con los http requests
  //Preguntar a Axel por el TableCell scope
}

export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MyType[]>();

  useEffect(() => {
    if (isLoading) {
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:8080/exercises", {
            method: "GET",
          });
          if (response.ok) {
            setData(await response.json());
            setError(null);
            setIsLoading(true);
          } else {
            setError("Hubo un error al obtener los datos");
            setIsLoading(true);
          }
        } catch (error: any) {
          setError("Hubo un problema con la petición Fetch:" + error.message);
          setIsLoading(true);
        }
      };
      fetchData();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
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

  if (data === undefined) {
    return <p>Ayuda</p>;
  } else {
    return (
      <TableContainer component={Paper}>
        <Table aria-label="exercises">
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.tags}</TableCell>
                <TableCell align="right">{row.numberErrorsSolution}</TableCell>
                <TableCell align="right">{row.statusSolution}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}
