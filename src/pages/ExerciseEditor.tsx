import { createTree, FileTree } from "../components/FileTree";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Box, Chip, IconButton, List, ListItem } from "@mui/material";
import {
  BatteryExercise,
  EditorExerciseData,
  ErrorSpring,
  ExerciseFile,
  LoginTypes,
  MyTreeNode,
  Tag
} from "../Types";
import { TreeStructure } from "../TreeStructure";
import { useLocation, useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { LoginContext } from "../Utils";
import TextField from "@mui/material/TextField";
import { MyBreadcrumbs } from "../components/navigation/MyBreadcrumbs";
import CustomTransferList from "../components/TransferList";
import { MyDropzone } from "../components/MyDropzone";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Add } from "@mui/icons-material";
import { AddBatteryDialog } from "../components/AddBatteryDialog";

export function ExerciseEditor() {

  const navigate = useNavigate();
  const loginStatus: LoginTypes = useContext(LoginContext);

  const [openBatteryDialog, setOpenBatteryDialog] = React.useState(false);

  const [exerciseId, setExerciseId] = useState<string>();
  const [exerciseName, setExerciseName] = useState<string>();
  const [batteryId, setBatteryId] = useState<string>();
  const [batteryName, setBatteryName] = useState<string>();
  const [statement, setStatement] = useState<string>();
  const [rules, setRules] = useState<string[]>();
  const [tags, setTags] = useState<Tag[]>();
  const [successCondition, setSuccessCondition] = useState<string>();

  const [templateFiles, setTemplateFiles] = useState<ExerciseFile[]>();
  const [allTags, setAllTags] = useState<Tag[]>();
  const [allExerciseBatteries, setAllExerciseBatteries] = useState<BatteryExercise[]>();

  const [selectedBatteryExercise, setSelectedBatteryExercise] = useState<BatteryExercise>();

  const [showStatementError, setShowStatementError] = React.useState(false);
  const [statementMessage, setStatementMessage] = React.useState("");

  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);

  /* Function that sets the accepted files variable if length is not 0 and are
  accepted beforehand with acceptedFiles from MyDropzone (it checks if there is
  1 or more files automatically).
  If we needed the rejected files, we would use another variable*/

  const accept = (acceptedFiles: File[]) => {

    if (acceptedFiles.length === 0) {
      setUploadedFile(null);
    } else {
      setUploadedFile(acceptedFiles[0]);
    }
  };


  //Variables for treefile management
  const [parentsIdList, setParentsIdList] = useState<string[]>([]);
  const [fileTree, setFileTree] = useState<TreeStructure>();
  const [rootNode, setRootNode] = useState<MyTreeNode>({
    nodeId: "0",
    label: "Exercise",
    file: null,
    children: []
  });



  // Functions to control the addBatteryDialog

  const handleDialogClose = (confirmed: boolean, inputValue? : string) => {

    console.log(confirmed, inputValue);

    if (confirmed && inputValue){
      console.log("El usuario escribió: ", inputValue);
    }else{
      console.log("Cancelado");
    }

    setOpenBatteryDialog(false);
  };

  const handleDialogOpen = () => {
    setOpenBatteryDialog(true);
  };




  //Use effect to get the exercise data when editing an exercise

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

        setAllExerciseBatteries(data.batteries);
        setAllTags(data.tags);

        const newTemplateFiles = data.files;
        setTemplateFiles(newTemplateFiles);

        const root: MyTreeNode | null = {
          nodeId: "0",
          label: "Exercise",
          file: null,
          children: []
        };

        let myTree = new TreeStructure();
        setRootNode(root);

        //Nodos a expandir (padres)
        const parentNodeIdList: string[] = ["0"];

        //Nodos del arbol
        myTree = createTree(myTree, newTemplateFiles, root, parentNodeIdList);

        setParentsIdList(parentNodeIdList);
        setFileTree(myTree);

      } catch (error: any) {
        console.log("Network error");
      }
    };
    void fetchData();
  }, [location.pathname]);


  //HANDLERS

  const handleExerciseBatteryClick = (battery: BatteryExercise ) => {
    setSelectedBatteryExercise(battery);
  };

  const handleSubmitFile = () => {
    //No se
  };

  return (
    <>
      <AddBatteryDialog open={openBatteryDialog} handleClose={handleDialogClose} />

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
          <Box sx={{ display: "flex", gap: 8 , marginTop: 4, justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ marginTop: 4, marginBottom: 1 }} variant="h6">
                Archivos
              </Typography>

              <Box
                sx={{
                  border: "2px solid #ccc",
                  borderRadius: 2,
                  paddingLeft: 4,
                  paddingRight: 4,
                  paddingTop: 1,
                  paddingBottom: 4,
                  cursor: "pointer"
                }}>

                <FileTree
                  expand={false}
                  onNodeSelect={() => null}
                  parents={parentsIdList}
                  nodeId={rootNode?.nodeId}
                  label={rootNode?.label}
                  children={rootNode?.children}
                />
                <MyDropzone handleDrop={accept} />


                {/*
                <Button
                  sx={{ marginTop: 2, marginBottom: 0 }}
                  startIcon={<FolderZipIcon />}
                  onClick={handleSubmitFile}
                  color="success"
                  variant="contained"
                  endIcon={<SendIcon />}
                >
                  <Typography variant="button">
                    <strong>Subir archivos</strong>
                  </Typography>
                </Button>
                */}


              </Box>
            </Box>


            <Box>
              <Typography sx={{ marginTop: 4, marginBottom: 1 }} variant="h6">
                Reglas
              </Typography>

              <Box width={600}
                   sx={{
                     border: "2px groove #ccc",
                     borderRadius: 2,
                     padding: 4,
                     color: "#888",
                     cursor: "pointer"
                   }}>

                <CustomTransferList />
              </Box>


              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, marginTop: 10, justifyContent: "space-between" }}>
                <Typography variant="h6">
                  Batería de Ejercicios
                </Typography>
                <Box sx={{ display: "flex"}}>
                  <Typography variant="h6">
                    {"Selected: "}
                  </Typography>
                  <Chip key={selectedBatteryExercise?.name} label={selectedBatteryExercise?.name} />
                </Box>
                <IconButton color="primary" onClick={handleDialogOpen}>
                  <Add />
                </IconButton>

              </Box>
              <Box
                width={50}
                sx={{
                  border: "2px groove #ccc",
                  borderRadius: 2,
                  padding: 2,
                  marginTop: 0,
                  cursor: "pointer",
                  width: "100%",
                  bgcolor: "background.paper"
                }}
              >
                <nav aria-label="Batterys">
                  <List
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 1
                    }}
                  >
                    {Array.from(allExerciseBatteries ?? []).map((battery) => (
                      <ListItem key={battery.name} sx={{ margin: 0, padding: 0, width: "200px" }}>
                        <ListItemButton onClick={() => handleExerciseBatteryClick(battery)}>
                          <ListItemText primary={battery.name} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </nav>
              </Box>
            </Box>
          </Box>
        </Container>


        <Container component="main" maxWidth="sm">


        </Container>

      </Box>
    </>
  );
}