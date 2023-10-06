import React, { useContext, useEffect, useState } from "react";
import { MonacoEditor } from "../components/MonacoEditor";
import { MyBreadcrumbs } from "../components/navigation/MyBreadcrumbs";
import {
  EditorData,
  ErrorSpring,
  ExerciseFile,
  LoginTypes,
  MyTreeNode,
} from "../Types";
import { useLocation, useNavigate } from "react-router-dom";
import { Allotment } from "allotment";
import { FileTree } from "../components/FileTree";
import { Box } from "@mui/material";
import { LoginContext } from "../Utils";
import { TreeStructure } from "../TreeStructure";

export function ExerciseEditor() {
  const location = useLocation();
  const loginStatus: LoginTypes = useContext(LoginContext);
  const navigate = useNavigate();
  const [exerciseName, setExerciseName] = useState<string>();
  const [exerciseId, setExerciseId] = useState<string>();
  const [batteryName, setBatteryName] = useState<string>();
  const [filesForDisplay, setFilesForDisplay] = useState<ExerciseFile[]>();
  const [templateFiles, setFreshFiles] = useState<ExerciseFile[]>();
  const [parentsIdList, setParentsIdList] = useState<string[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [fileTree, setFileTree] = useState<TreeStructure>();
  const [editorValue, setEditorValue] = useState<string>(
    "//Selecciona uno de los archivos de la derecha para verlo y, si es posible, editarlo.\n" +
      "//Select one of the files on the right to view it here and, if possible, edit it.\n"
  );
  const [rootNode, setRootNode] = useState<MyTreeNode>({
    nodeId: "0",
    label: "Exercise",
    children: [],
  });

  const handleEditorChange = (value: string) => {
    setEditorValue(value);
    setUnsavedChanges(false);
  };

  const handleNodeSelect = (
    _event: React.SyntheticEvent,
    nodeIds: Array<string> | string
  ) => {
    const nodeId = Array.isArray(nodeIds) ? nodeIds[0] : nodeIds;
    if (fileTree === undefined) {
      /*TODO qué hacer si el arbol no se ha generado todavía? Querría decir que
      el fetch no se ha realizado y sin embargo se ha seleccionado un nodo
      no tiene sentido*/
      return;
    }

    const selectedNode = fileTree.findNodeById(nodeId);
    if (selectedNode && selectedNode.file) {
      console.log(selectedNode.file.content);
      setEditorValue(selectedNode.file.content);
    }

    setUnsavedChanges(false);
  };

  //Auto-save function every X seconds
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (unsavedChanges) {
        //saveChangesToServer(editorValue);
        setUnsavedChanges(false);
      }
    }, 3000); // Wait 3 seconds of inactivity before saving

    return () => clearTimeout(saveTimeout);
  }, [editorValue, unsavedChanges]);

  //Fetching files for the editor to show and setting up states
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
        setFreshFiles(data.templateFiles);
        setFilesForDisplay(data.filesForDisplay);
      } catch (error: any) {
        /*TODO: queda pendiente ver qué hacer si el ejercicio no existe, literalmente poner texto
        de ejemplo diciendo que seleccionemos un objeto en el árbol de ficheros*/
      }
    };
    fetchData();
  }, [location.pathname]);

  useEffect(() => {
    let counter = 1;

    const root: MyTreeNode | null = {
      nodeId: "0",
      label: "Exercise",
      children: [],
    };

    const myTree = new TreeStructure();
    myTree.addNode(root);

    const filesAndDirectories: string[] = [];
    const parentNodeIdList: string[] = ["0"];

    //Recorremos todos los archivos que se van a mostrar
    filesForDisplay?.forEach((file) => {
      let parentName = "Exercise";
      let parent: MyTreeNode | null;
      let fileContent: ExerciseFile | null = null;

      //Dividimos los paths de cada fichero para crear los nodos de un arbol
      const pathNames = file.path.split("/");
      pathNames.forEach((name, index) => {
        /*El primer nombre de la ruta siempre tendrá como padre el nodo Root
         * en caso contrario el anterior nodo será el padre del actual*/
        if (index === 0) {
          parent = root;
        } else {
          parent = myTree.findNodeByLabel(parentName);
          /*Si estamos en el nombre de la ruta correspondiente a un archivo
           * asignamos el contenido del archivo a la propiedad content del nodo*/
          if (index === pathNames.length - 1) {
            fileContent = file;
          }
        }

        if (!filesAndDirectories.includes(name)) {
          const newNode: MyTreeNode = {
            nodeId: (counter++).toString(),
            label: name,
            file: fileContent,
            children: [],
          };
          myTree.addNode(newNode, parent);
          filesAndDirectories.push(name);
          if (parent && !parentNodeIdList.includes(parent.nodeId)) {
            parentNodeIdList.push(parent.nodeId);
          }
        }
        parentName = name;
        fileContent = null;
      });
    });

    setRootNode(root);
    setFileTree(myTree);
    setParentsIdList(parentNodeIdList);

    /*filesForDisplay?.forEach((file, index) => {
      const nodoPrueba = tree.parse({
        nodeId: (index + 1).toString(),
        label: file.name,
      });
      root.addChild(nodoPrueba);
    });

    filesForDisplay?.forEach((file) => {
      console.log(
        "File for display: " + file.name + ": " + file.idFromSolution
      );
    });
    console.log("\n");
    freshFiles?.forEach((file) => {
      console.log("Fresh File: " + file.name + ": " + file.idFromSolution);
    });*/
  }, [filesForDisplay]);

  /*
  const nodoPrueba: Node<string> = tree.parse({
    nodeId: "2",
    label: "Prueba",
    children: [],
  });

  root.addChild(nodoPrueba);*/

  return (
    <>
      <MyBreadcrumbs exerciseName={exerciseName} batteryName={batteryName} />
      <Box className="editor-page" sx={{ width: "100%", mt: "1%" }}>
        <Allotment>
          <Allotment.Pane snap>
            <Box>{rootNode?.label}</Box>
          </Allotment.Pane>
          <Box padding="20px">
            <Allotment.Pane visible snap>
              <MonacoEditor
                onChange={handleEditorChange}
                textValue={editorValue}
              />
            </Allotment.Pane>
          </Box>
          <Allotment.Pane preferredSize="25%" minSize={100} snap>
            <Box sx={{ pl: "5%" }}>
              <FileTree
                onNodeSelect={handleNodeSelect}
                parents={parentsIdList}
                nodeId={rootNode?.nodeId}
                label={rootNode?.label}
                children={rootNode?.children}
              />
            </Box>
          </Allotment.Pane>
        </Allotment>
      </Box>
    </>
  );
}
