import { FileTree } from "../components/FileTree";
import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { EditorExerciseData, ErrorSpring, ExerciseFile, MyTreeNode, Tag } from "../Types";
import { TreeStructure } from "../TreeStructure";
import { useLocation } from "react-router-dom";

export function ExerciseEditor() {

  const [exerciseId, setExerciseId] = useState<string>();
  const [exerciseName, setExerciseName] = useState<string>();
  const [batteryId, setBatteryId] = useState<string>();
  const [batteryName, setBatteryName] = useState<string>();
  const [statement, setStatement] = useState<string>();
  const [rules, setRules] = useState<string[]>();
  const [tags, setTags] = useState<Tag[]>();
  const [successCondition, setSuccessCondition] = useState<string>();

  //const [templateFiles, setTemplateFiles] = useState<ExerciseFile[]>();

  const [parentsIdList, setParentsIdList] = useState<string[]>([]);
  const [fileTree, setFileTree] = useState<TreeStructure>();
  const [rootNode, setRootNode] = useState<MyTreeNode>({
    nodeId: "0",
    label: "Exercise",
    file: null,
    children: []
  });


  const location = useLocation();

  useEffect(() => {
    const exerciseId = decodeURI(
      location.pathname.slice(location.pathname.lastIndexOf("/") + 1)
    );

    const fetchData = async () => {
      try {

        const response = await fetch(
          "http://localhost:8080/exercises/edit/" + exerciseId,
          {
            method: "GET",
            credentials: "include"
          }
        );

        if (!response.ok) {
          const errorExercise: ErrorSpring = await response.json();
          throw new Error("Error from backend - " + errorExercise.message);
        }

        const data: EditorExerciseData = await response.json();

        setExerciseId(exerciseId);
        setExerciseName(data.exercise.name);
        setBatteryId(data.exercise.idFromBattery);
        setBatteryName(data.exercise.nameFromBattery);
        setStatement(data.exercise.statement);
        setRules(data.exercise.rules);
        setTags(data.exercise.tags);
        setSuccessCondition(data.exercise.successCondition);

        const files = data.files;

        const root: MyTreeNode | null = {
          nodeId: "0",
          label: "Exercise",
          file: null,
          children: []
        };

        const myTree = new TreeStructure();
        myTree.addNode(root);

        const filesAndDirectories: string[] = [];
        const parentNodeIdList: string[] = ["0"];
        let counter = 1;

        //Recorremos todos los archivos que se van a mostrar
        files?.forEach((file) => {
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
                children: []
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
      } catch (error: any) {
        console.log("Network error");
      }
    };
    void fetchData();
  },[location.pathname]);

  const handleNodeSelect = ()=> {
    return null;
  }


  return (
    <Box className="file-pane">
      <Box className="file-selector"
      >
        <FileTree
          onNodeSelect={handleNodeSelect}
          parents={parentsIdList}
          nodeId={rootNode?.nodeId}
          label={rootNode?.label}
          children={rootNode?.children}
        />
      </Box>
    </Box>);

}