import React, { useEffect, useRef } from "react";
import { MonacoEditor } from "../components/MonacoEditor";
import { MyBreadcrumbs } from "../components/MyBreadcrumbs";
import { ErrorSpring, Exercise } from "../Types";
import { useLocation } from "react-router-dom";
import { Allotment } from "allotment";
import { FileTree } from "../components/FileTree";
import { Box } from "@mui/material";
import TreeModel from "tree-model";
import { treeData } from "../Utils";

export function ExerciseEditor() {
  const location = useLocation();
  const exerciseNameRef = useRef<string | undefined>();
  const batteryNameRef = useRef<string | undefined>();

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
          }
        );

        if (!response.ok) {
          const errorExercise: ErrorSpring = await response.json();
          throw new Error("Error from backend - " + errorExercise.message);
        }

        const exercise: Exercise = await response.json();
        exerciseNameRef.current = exercise.name;
        batteryNameRef.current = exercise.batteryName;
      } catch (error: any) {
        //TODO queda pendiente ver qué hacer si el ejercicio no existe
      }
    };
    fetchData();
  }, []);

  const tree = new TreeModel();
  const root = tree.parse(treeData);

  return (
    <>
      <MyBreadcrumbs
        exerciseName={exerciseNameRef.current}
        batteryName={batteryNameRef.current}
      />
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
