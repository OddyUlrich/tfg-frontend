import React, { useContext, useEffect, useState } from "react";
import { MonacoEditor } from "../components/MonacoEditor";
import { MyBreadcrumbs } from "../components/navigation/MyBreadcrumbs";
import { EditorData, ErrorSpring, LoginTypes } from "../Types";
import { useLocation, useNavigate } from "react-router-dom";
import { Allotment } from "allotment";
import { FileTree } from "../components/FileTree";
import { Box } from "@mui/material";
import TreeModel, { Node } from "tree-model";
import { LoginContext, treeData } from "../Utils";

export function ExerciseEditor() {
  const location = useLocation();
  const [exerciseName, setExerciseName] = useState<string>();
  const [exerciseId, setExerciseId] = useState<string>();
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

        const data: EditorData = await response.json();
        setExerciseName(data.exercise.name);
        setExerciseId(data.exercise.id);
        setBatteryName(data.exercise.nameFromBattery);
      } catch (error: any) {
        /*TODO: queda pendiente ver qué hacer si el ejercicio no existe, literalmente poner texto
        de ejemplo diciendo que seleccionemos un objeto en el árbol de ficheros*/
      }
    };
    fetchData();
  }, [location.pathname]);

  useEffect(() => {
    console.log(
      "Datos: " +
        "Nombre Ejercicio - " +
        exerciseName +
        ": " +
        exerciseId +
        ", Batteria: " +
        batteryName
    );
  }, [batteryName, exerciseId, exerciseName]);

  const tree = new TreeModel();
  const root: Node<string> = tree.parse({
    nodeId: "1",
    label: "Project",
  });

  const nodoPrueba: Node<string> = tree.parse({
    nodeId: "2",
    label: "Prueba",
    children: [],
  });

  root.addChild(nodoPrueba);

  nodoPrueba.getPath().forEach((node, index) => {
    console.log(
      "Nodo numero " + index + ": " + node.model.label + " " + node.model.nodeId
    );
  });

  return (
    <>
      <MyBreadcrumbs exerciseName={exerciseName} batteryName={batteryName} />
      <Box className="editor-page" width="100%">
        <Allotment>
          <Allotment.Pane minSize={250} snap>
            <FileTree
              nodeId={root.model.nodeId}
              label={root.model.label}
              children={root.model.children}
            />
          </Allotment.Pane>
          <Allotment.Pane snap>
            <Box>{root.model.label}</Box>
          </Allotment.Pane>
          <Box padding="20px">
            <Allotment.Pane visible snap>
              <MonacoEditor />
            </Allotment.Pane>
          </Box>
        </Allotment>
      </Box>
    </>
  );
}
