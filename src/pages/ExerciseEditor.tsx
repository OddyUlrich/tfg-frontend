import React, { useContext, useEffect, useState } from "react";
import { MonacoEditor } from "../components/MonacoEditor";
import { MyBreadcrumbs } from "../components/navigation/MyBreadcrumbs";
import { ErrorSpring, ExerciseCode, LoginTypes } from "../Types";
import { useLocation, useNavigate } from "react-router-dom";
import { Allotment } from "allotment";
import { FileTree } from "../components/FileTree";
import { Box } from "@mui/material";
import TreeModel from "tree-model";
import { LoginContext, treeData } from "../Utils";

export function ExerciseEditor() {
  const location = useLocation();
  const [exerciseName, setExerciseName] = useState<string>();
  const [batteryName, setBatteryName] = useState<string>();
  const loginStatus: LoginTypes = useContext(LoginContext);
  const navigate = useNavigate();

  useEffect(() => {
    const exerciseId = decodeURI(
      location.pathname.slice(location.pathname.lastIndexOf("/") + 1)
    );

    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/exercises/" + exerciseId,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorExercise: ErrorSpring = await response.json();
          throw new Error("Error from backend - " + errorExercise.message);
        }

        const exercise: ExerciseCode = await response.json();
        setExerciseName(exercise.name);
        setBatteryName(exercise.exerciseBattery.name);
      } catch (error: any) {
        //TODO: queda pendiente ver qué hacer si el ejercicio no existe, literalmente poner texto
        //TODO: de ejemplo diciendo que seleccionemos un objeto en el arbol de ficheros
      }
    };
    fetchData();
  }, [location.pathname]);

  const tree = new TreeModel();
  const root = tree.parse(treeData);

  return (
    <>
      <MyBreadcrumbs exerciseName={exerciseName} batteryName={batteryName} />
      <Box className="editor-size" width="100%">
        <Allotment>
          <Allotment.Pane snap>
            <FileTree
              nodeId={root.model.nodeId}
              label={root.model.label}
              children={root.model.children}
            />
          </Allotment.Pane>
          <Allotment.Pane snap>
            <Box>{root.model.label}</Box>
          </Allotment.Pane>
          <Allotment.Pane visible snap>
            <MonacoEditor />
          </Allotment.Pane>
        </Allotment>
      </Box>
    </>
  );
}
