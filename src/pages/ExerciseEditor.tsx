import { FileTree } from "../components/FileTree";
import React, { useContext, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { EditorExerciseData, ErrorSpring, ExerciseFile, LoginTypes, MyTreeNode, Tag } from "../Types";
import { TreeStructure } from "../TreeStructure";
import { useLocation, useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { LoginContext } from "../Utils";
import TextField from "@mui/material/TextField";
import { MyBreadcrumbs } from "../components/navigation/MyBreadcrumbs";
import CustomTransferList from "../components/TransferList";

export function ExerciseEditor() {

  const navigate = useNavigate();
  const loginStatus: LoginTypes = useContext(LoginContext);

  const [exerciseId, setExerciseId] = useState<string>();
  const [exerciseName, setExerciseName] = useState<string>();
  const [batteryId, setBatteryId] = useState<string>();
  const [batteryName, setBatteryName] = useState<string>();
  const [statement, setStatement] = useState<string>();
  const [rules, setRules] = useState<string[]>();
  const [tags, setTags] = useState<Tag[]>();
  const [successCondition, setSuccessCondition] = useState<string>();

  const [showStatementError, setShowStatementError] = React.useState(false);
  const [statementMessage, setStatementMessage] = React.useState("");

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

        if (response.status === 403) {
          loginStatus.setIsLogged(false);
          navigate("/login");
        } else if (!response.ok) {
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
  }, [location.pathname]);


  return (
    <>
      <MyBreadcrumbs exerciseName={exerciseName} batteryName={batteryName} />
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", marginTop: 4 }}>
        <Container component="main" maxWidth="sm">
          <Typography variant="h6">
            Nombre del ejercicio
          </Typography>
          <TextField
            sx={{ marginTop: 1 }}
            margin="normal"
            variant={"outlined"}
            required
            fullWidth
            multiline={true}
            id="ExerciseName"
            label="Name"
            name="ExerciseName"
            autoComplete="ExerciseName"
            error={showStatementError}
            helperText={statementMessage}
            autoFocus
          />

          <Typography sx={{ display: "flex", justifyContent: "space-between", marginTop: 4 }} variant="h6">
            Enunciado del ejercicio
          </Typography>
          <TextField
            sx={{ marginTop: 1 }}
            margin="normal"
            variant={"outlined"}
            required
            fullWidth
            multiline={true}
            id="Statement"
            label="Statement"
            name="Statement"
            autoComplete="Statement"
            error={showStatementError}
            helperText={statementMessage}
            autoFocus
          />
        </Container>

        <Container component="main" maxWidth="lg">
          <Box sx={{ display: "flex", gap: 4, marginTop: 4, justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ marginTop: 4, marginBottom: 1 }} variant="h6">
                Archivos
              </Typography>
              <Box
                sx={{
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  paddingLeft: 2,
                  paddingRight: 6,
                  paddingTop: 1,
                  paddingBottom: 4,
                  color: "#888",
                  cursor: "pointer",
                  transition: "border 0.3s",
                  "&:hover": {
                    borderColor: "#1976d2"
                  }
                }}>

                <FileTree
                  expand={false}
                  onNodeSelect={() => null}
                  parents={parentsIdList}
                  nodeId={rootNode?.nodeId}
                  label={rootNode?.label}
                  children={rootNode?.children}
                />
              </Box>
            </Box>

            <Box>
              <Typography sx={{ marginTop: 4, marginBottom: 1}} variant="h6">
                Reglas
              </Typography>

              <Box
                sx={{
                  border: "2px groove #ccc",
                  borderRadius: 2,
                  padding: 4,
                  color: "#888",
                  cursor: "pointer"
                }}>

                <CustomTransferList></CustomTransferList>

              </Box>
            </Box>
          </Box>
        </Container>

      </Box>
    </>
  );
}