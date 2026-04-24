import { createTree, FileTree } from "../components/FileTree";
import React, {useContext, useEffect, useState } from "react";
import { Box, IconButton, List, ListItem, Tooltip } from "@mui/material";
import {
  BatteryExercise, EditorCommonExerciseData,
  EditorExerciseData,
  ErrorSpring,
  ExerciseFile,
  LoginTypes,
  MyTreeNode,
  Tag
} from "../Types";
import { freeTree, TreeStructure } from "../TreeStructure";
import { useNavigate, useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { LoginContext } from "../Utils";
import TextField from "@mui/material/TextField";
import { MyBreadcrumbs } from "../components/navigation/MyBreadcrumbs";
import CustomTransferList from "../components/TransferList";
import { DropzoneExerciseFiles } from "../components/DropzoneExerciseFiles";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Add, Info } from "@mui/icons-material";
import { AddBatteryDialog } from "../components/Dialogs/AddBatteryDialog";
import { AddTagDialog } from "../components/Dialogs/AddTagDialog";
import JSZip from "jszip";

export function ExerciseEditor() {

  const navigate = useNavigate();
  const loginStatus: LoginTypes = useContext(LoginContext);

  //Dialogs for new content
  const [openBatteryDialog, setOpenBatteryDialog] = React.useState(false);
  const [openTagDialog, setOpenTagDialog] = React.useState(false);

  //Breadcrumbs data
  const [exerciseNameBreadcrumb, setExerciseNameBreadcrumb] = useState<string>();
  const [batteryNameBreadcrumb, setBatteryNameBreadcrumb] = useState<string>();

  //Exercise data
  const [exerciseName, setExerciseName] = useState<string>();
  const [batteryId, setBatteryId] = useState<string>();
  const [batteryName, setBatteryName] = useState<string>();
  const [statement, setStatement] = useState<string>();
  const [rules, setRules] = useState<string[]>();
  const [tags, setTags] = useState<Tag[]>();
  const [successCondition, setSuccessCondition] = useState<string>();

  const [templateFiles, setTemplateFiles] = useState<ExerciseFile[]>();

  /*We extract the parameter of this route to check if we must fetch an specific
  exercise data for edit mode or only the data needed for creation */
  const { exerciseId } = useParams<{exerciseId: string}>();
  const isEdit = !!exerciseId;

  //All tags and batteries for selection
  const [allTags, setAllTags] = useState<Tag[]>();
  const [allExerciseBatteries, setAllExerciseBatteries] = useState<BatteryExercise[]>();

  const [showStatementError, setShowStatementError] = React.useState(false);
  const [statementMessage, setStatementMessage] = React.useState("");

  //Variables for treefile management
  const [parentsIdList, setParentsIdList] = useState<string[]>([]);
  const [fileTree, setFileTree] = useState<TreeStructure>();
  const [rootNode, setRootNode] = useState<MyTreeNode>({
    nodeId: "0",
    label: "Exercise",
    file: null,
    children: []
  });

  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);

  // Functions to control the addBatteryDialog
  const handleBatteryDialogClose = (confirmed: boolean, inputValue? : string) => {

    console.log(confirmed, inputValue);

    if (confirmed && inputValue){
      console.log("El usuario escribió: ", inputValue);
    }else{
      console.log("Cancelado");
    }

    setOpenBatteryDialog(false);
  };

  const handleBatteryDialogOpen = () => {
    setOpenBatteryDialog(true);
  };
  // Ending of functions to control the addBateryDialog

  // Functions to control the addTagDialog
  const handleTagDialogClose = (confirmed: boolean, inputValue? : string) => {

    if (confirmed && inputValue){
      console.log("El usuario escribió: ", inputValue);
    }else{
      console.log("Cancelado");
    }

    setOpenTagDialog(false);
  };

  const handleTagDialogOpen = () => {
    setOpenTagDialog(true);
  };
  // Ending of functions to control the addTagDialog

  /* Function that sets the accepted files variable if length is not 0 and are
  accepted beforehand with acceptedFiles from DropzoneExerciseFiles (it checks
  if there is 1 or more files automatically).
  If we needed the rejected files, we would use another variable*/

  const accept = async (acceptedFiles: File[]) => {

    if (acceptedFiles.length === 0) {
      setUploadedFile(null);
    } else {
      setUploadedFile(acceptedFiles[0]);
      let counter = 1;

      const filesForDisplay:ExerciseFile[] = [];

      const zip = await JSZip.loadAsync(acceptedFiles[0]);

      for (const path of Object.keys(zip.files)) {
        const file = zip.files[path];

        //Checks if it is not a folder
        if (!file.dir) {
          const content = await file.async("text");

          const pathNames = path.split("/");
          const name = pathNames[pathNames.length - 1];

          const exerciseFile:ExerciseFile = {id: counter.toString(), name: name, path: path, text: content, idFromSolution: null, editableMethods: null};

          filesForDisplay.push(exerciseFile);
          counter++;
        }
      }

      //If there was a tree previously we clean it
      freeTree(rootNode);

      //Nodos a expandir (padres, empezamos por el nodo root)
      const parentNodeIdList: string[] = ["0"];

      //Create a new tree
      const newTree = createTree(fileTree ?? new TreeStructure(), filesForDisplay, rootNode, parentNodeIdList);
      setFileTree(newTree);
      setParentsIdList(parentNodeIdList);

    }
  };

  //Use effect to get the exercise data when creating/editing an exercise
  useEffect(() => {

    const controller = new AbortController();

    const fetchBatteriesAndTags = async () => {
      try {

        const responseTags = await fetch(
          "http://localhost:8080/tags",
          {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          }
        );

        const responseBatteries = await fetch(
          "http://localhost:8080/exerciseBatteries",
          {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (responseTags.status === 403 || responseBatteries.status === 403) {
          loginStatus.setIsLogged(false);
          navigate("/login");
          return;

        } else if (!responseTags.ok) {
          const errorExercise: ErrorSpring = await responseTags.json();
          throw new Error("Error from tags data on backend - Error " + errorExercise.status + ": " + errorExercise.message);

        }else if (!responseBatteries.ok){
          const errorExercise: ErrorSpring = await responseBatteries.json();
          throw new Error("Error from exercise batteries  data on backend - Error " + errorExercise.status + ": " + errorExercise.message);
        }

        //Common data for all exercises, the list of all batteries and tags
        const batteries = await responseBatteries.json();
        setAllExerciseBatteries(batteries);

        const tags = await responseTags.json();
        setAllTags(tags);

        } catch (error: any) {
          if (error.name !== "AbortError") {
            console.log("Network error: " + error.message);
          }
        }
      }

    const fetchExerciseData = async () => {
      try {

        const responseExerciseData = await fetch(
          "http://localhost:8080/exercises/" + exerciseId,
          {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (responseExerciseData.status === 403) {
          loginStatus.setIsLogged(false);
          navigate("/login");
          return;
        } else if ( !responseExerciseData.ok) {
          const errorExercise: ErrorSpring = await responseExerciseData.json();
          throw new Error("Error from exercise data on backend - Error " + errorExercise.status + ": " + errorExercise.message);
        }

        const exerciseData: EditorExerciseData = await responseExerciseData.json();

        //If we are editing we see the data and set it
        setExerciseName(exerciseData.exercise.name);
        setBatteryId(exerciseData.exercise.idFromBattery);
        setBatteryName(exerciseData.exercise.nameFromBattery);
        setStatement(exerciseData.exercise.statement);
        setRules(exerciseData.exercise.rules);
        setTags(exerciseData.exercise.tags);
        setSuccessCondition(exerciseData.exercise.successCondition);

        //Setting breadcrumb data
        setExerciseNameBreadcrumb(exerciseData.exercise.name);
        setBatteryNameBreadcrumb(exerciseData.exercise.nameFromBattery);

        const newTemplateFiles = exerciseData.files;
        setTemplateFiles(newTemplateFiles);

        const root: MyTreeNode | null = {
          nodeId: "0",
          label: "Exercise",
          file: null,
          children: []
        };

        let myTree = new TreeStructure();
        setRootNode(root);

        //Nodos a expandir (padres, empezamos por el nodo root)
        const parentNodeIdList: string[] = ["0"];

        //Nodos del arbol
        myTree = createTree(myTree, newTemplateFiles, root, parentNodeIdList);
        setFileTree(myTree);

        //Nodos a expandir (padres) una vez terminado el arbol
        setParentsIdList(parentNodeIdList);

      } catch (error: any) {
          if (error.name !== "AbortError") {
            console.log("Network error: " + error.message);
          }
      }

    };

    void fetchBatteriesAndTags();

    if (isEdit){
      void fetchExerciseData();
    }

    // CLEANUP
    return () => {
      controller.abort();
    };

  }, []);


  //HANDLERS

  const handleExerciseBatteryClick = (battery: BatteryExercise ) => {
    setBatteryName(battery.name);
  };

  const handleTagClick = (tagMarcada: Tag ) => {

    if (tags && tags.some(tag => tag.name === tagMarcada.name)){
      const newTags = tags.filter(tag => tag.name !== tagMarcada.name)
      setTags(newTags);
    }else{
      const newTags = [...(tags ?? []), tagMarcada];
      setTags(newTags);
    }
  };

  const handleSubmit = () => {
    const controller = new AbortController();

    const method = isEdit ? "PATCH" : "POST"

    /*if (isEdit){
      PATCH - edit.fetch
    }else{
      POST - new.fetch
    }*/

    try {

      /*if (exerciseId){}
      const responseExerciseData = await fetch(
        "http://localhost:8080/exercises/edit/" + exerciseId,
        {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        }
      );

      const exerciseData: EditorExerciseData = await responseExerciseData.json();

      //If we are editing we see the data and set it
      setExerciseName(exerciseData.exercise.name);
      setBatteryId(exerciseData.exercise.idFromBattery);
      setBatteryName(exerciseData.exercise.nameFromBattery);
      setStatement(exerciseData.exercise.statement);
      setRules(exerciseData.exercise.rules);
      setTags(exerciseData.exercise.tags);
      setSuccessCondition(exerciseData.exercise.successCondition);*/


    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.log("Network error: " + error.message);
      }
    }
  };

  return (
    <>
      <AddBatteryDialog open={openBatteryDialog} handleClose={handleBatteryDialogClose} />
      <AddTagDialog open={openTagDialog} handleClose={handleTagDialogClose} />

      <MyBreadcrumbs
        exerciseName={exerciseNameBreadcrumb}
        batteryName={batteryNameBreadcrumb}
      />

      <form onSubmit={handleSubmit}>
      <Container component="main" sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", marginTop: 4 }}>
        <Container maxWidth="sm" >
          <TextField
            sx={{ marginTop: 1 }}
            margin="normal"
            variant={"outlined"}
            required
            fullWidth
            multiline={true}
            id="ExerciseName"
            label="Nombre del ejercicio"
            name="ExerciseName"
            autoComplete="ExerciseName"
            value={exerciseName}
            onChange={(e => {setExerciseName(e.target.value)})}
            error={showStatementError}
            helperText={statementMessage}
            autoFocus
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            sx={{ marginTop: 1 }}
            margin="normal"
            variant={"outlined"}
            required
            fullWidth
            multiline={true}
            id="Statement"
            label="Enunciado del ejercicio"
            name="Statement"
            rows={6}
            autoComplete="Statement"
            value={statement}
            onChange={(e => {setStatement(e.target.value)})}
            error={showStatementError}
            helperText={statementMessage}

          />
        </Container>

        {/*TODO No puede haber este component main y otro más arriba*/}
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", gap: 8 , marginTop: 2 }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginTop: 4, marginBottom: 0 }}>
                <Typography variant="h6">
                  Archivos
                </Typography>
                <Tooltip title="Debes subir un .zip con los archivos del ejercicio ya con la estructura deseada"
                slotProps={{
                  tooltip: {
                    sx: {
                      fontSize: "1rem",
                      maxWidth: 400
                    }
                  }
                }}>
                  <IconButton size="small">
                    <Info color="action" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>

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
                  expand={true}
                  onNodeSelect={() => null}
                  parents={parentsIdList}
                  nodeId={rootNode?.nodeId}
                  label={rootNode?.label}
                  children={rootNode?.children}
                />
                <DropzoneExerciseFiles handleDrop={accept} />

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


              <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginTop: 4, marginBottom: 0 }}>
                <Typography variant="h6">
                  Condición de éxito
                </Typography>
                <Tooltip title="Aquello que quieras que el alumno saque por consola al finalizar el programa. Escribe el texto exacto, por favor."
                slotProps={{
                  tooltip: {
                    sx: {
                      fontSize: "1rem",
                      maxWidth: 500
                    }
                  }
                }}>
                  <IconButton size="small">
                    <Info color="action" />
                  </IconButton>
                </Tooltip>
              </Box>

              <TextField
                margin="normal"
                variant={"outlined"}
                required
                fullWidth
                multiline={true}
                id="successCondition"
                name="successCondition"
                rows={4}
                onChange={(e => {setSuccessCondition(e.target.value)})}
                placeholder={"Ejemplo:\n> El sumatorio de floats es 27.5"}
                sx={{ whiteSpace: "pre-line" }}
              />

            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginTop: 4, marginBottom: 0 }}>
                <Typography variant="h6">
                  Reglas
                </Typography>
                <Tooltip title="Aquellas clases, variables y funciones que quieres que aparezcan en el código del alumno"
                slotProps={{
                  tooltip: {
                     sx: {
                       fontSize: "1rem",
                       maxWidth: 400
                     }
                   }
                  }}>
                    <IconButton size="small">
                      <Info color="action" />
                    </IconButton>
                </Tooltip>
              </Box>

              <Box width={700}
                   sx={{
                     border: "2px groove #ccc",
                     borderRadius: 2,
                     padding: 4,
                     color: "#888",
                     cursor: "pointer"
                   }}>
                <CustomTransferList/>
              </Box>

              <Box
                maxWidth={700}
                sx={{
                  position: "relative",
                  marginTop: 10
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginTop: 4, marginBottom: 0 }}>
                  <Typography variant="h6">
                    Batería de Ejercicios
                  </Typography>
                  <Tooltip title="Los ejercicios de la página principal se agruparán en estas categorías"
                  slotProps={{
                    tooltip: {
                      sx: {
                        fontSize: "1rem",
                        maxWidth: 300
                      }
                    }
                  }}>
                    <IconButton size="small">
                      <Info color="action" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <IconButton
                  color="primary"
                  onClick={handleBatteryDialogOpen}
                  sx={{
                    position: "absolute",
                    right: 0,
                    bottom: 0
                  }}
                >
                  <Add />
                </IconButton>
              </Box>

              <Box
                maxWidth={700}
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
                        <ListItemButton sx={{backgroundColor: batteryName === battery.name ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}} onClick={() => handleExerciseBatteryClick(battery)}>
                          <ListItemText primary={battery.name} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </nav>
              </Box>

              <Box
                maxWidth={700}
                sx={{
                  position: "relative",
                  marginTop: 10
                }}
              >

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginTop: 4, marginBottom: 0 }}>
                  <Typography variant="h6">
                    Tags
                  </Typography>
                  <Tooltip title="Estas etiquetas señalan qué tareas se requieren hacer en el ejercicio"
                   slotProps={{
                    tooltip: {
                      sx: {
                        fontSize: "1rem",
                        maxWidth: 300
                      }
                    }
                  }}>
                    <IconButton size="small">
                      <Info color="action" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <IconButton
                  color="primary"
                  onClick={handleTagDialogOpen}
                  sx={{
                    position: "absolute",
                    right: 0,
                    bottom: 0
                  }}
                >
                  <Add />
                </IconButton>
              </Box>

              <Box
                maxWidth={700}
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
                <List
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 1
                  }}
                >
                  {Array.from(allTags ?? []).map((tag) => (
                    <ListItem key={tag.name} sx={{ margin: 0, padding: 0, width: "200px" }}>
                      <ListItemButton sx={{backgroundColor: tags && tags.some(knownTags => knownTags.name === tag.name) ?
                          'rgba(255, 255, 255, 0.1)' :
                          'transparent'
                      }} onClick={() => handleTagClick(tag)}>
                        <ListItemText primary={tag.name} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>


          </Box>
        </Container>

      </Container>
      </form>
    </>
  );
}