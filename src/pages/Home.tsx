import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";

function createData(
  name: string,
  etiqueta: string,
  favorito: boolean,
  estado: string
) {
  return { name, etiqueta, favorito, estado };
}

const rows = [
  createData("Ejercicio 1", "Herencia", true, "pending"),
  createData("Ejercicio 2", "Poliformismo", false, "completado"),
  createData("Ejercicio 3", "Getters", false, "pending"),
  createData("Ejercicio 4", "Etiqueta Profesor", false, "errores"),
];

{
  //Obtener los datos con los http requests
  //Preguntar a Axel por el TableCell scope
}

export function Home() {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="exercises">
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">
                {row.favorito ? "true" : "false"}
              </TableCell>
              <TableCell align="right">{row.etiqueta}</TableCell>
              <TableCell align="right">{row.estado}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
