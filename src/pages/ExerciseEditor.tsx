import { createTree, FileTree } from "../components/tree/FileTree";
import React, {useContext, useEffect, useState } from "react";
import { Box, Divider, IconButton, List, ListItem, Paper, Tooltip } from "@mui/material";
import {
  BatteryExercise,
  EditorExerciseData,
  ErrorSpring, Exercise,
  ExerciseFile,
  LoginTypes,
  MyTreeNode, ProcessedRules, Rule,
  Tag,
} from "../Types";
import { TreeStructure } from "../TreeStructure";
import { useNavigate, useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { LoginContext, useErrorHandler } from "../Utils";
import TextField from "@mui/material/TextField";
import { MyBreadcrumbs } from "../components/navigation/MyBreadcrumbs";
import { DropzoneExerciseFiles } from "../components/DropzoneExerciseFiles";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Add, Info } from "@mui/icons-material";
import { AddBatteryDialog } from "../components/dialogs/AddBatteryDialog";
import { AddTagDialog } from "../components/dialogs/AddTagDialog";
import JSZip from "jszip";
import { enqueueSnackbar } from "notistack";
import Button from "@mui/material/Button";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export function ExerciseEditor() {

  const navigate = useNavigate();
  const loginStatus: LoginTypes = useContext(LoginContext);
  const errorHandler = useErrorHandler();

  //dialogs for new content
  const [openBatteryDialog, setOpenBatteryDialog] = React.useState(false);
  const [openTagDialog, setOpenTagDialog] = React.useState(false);

  //Breadcrumbs data
  const [exerciseNameBreadcrumb, setExerciseNameBreadcrumb] = useState<string>();
  const [batteryNameBreadcrumb, setBatteryNameBreadcrumb] = useState<string>();

  //Exercise data
  const [exercise, setExercise] = useState<Exercise>({
    id: null,
    name: "",
    statement: "",
    nameFromBattery: "",
    requiredRules: [],
    forbiddenRules: [],
    tags: [],
  });

  const [unproccessedRules, setUnproccessedRules] = React.useState<string>();

  const [templateFiles, setTemplateFiles] = useState<ExerciseFile[]>([]);

  /*We extract the parameter of this route to check if we must fetch an specific
  exercise data for edit mode or only the data needed for creation */
  const { exerciseId } = useParams<{exerciseId: string}>();
  const isEdit = !!exerciseId;

  //All tags and batteries for selection
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allExerciseBatteries, setAllExerciseBatteries] = useState<BatteryExercise[]>([]);

  //Variables for treefile management
  const [parentsIdList, setParentsIdList] = useState<string[]>([]);
  const [rootNode, setRootNode] = useState<MyTreeNode>({
    nodeId: "0",
    label: "Exercise",
    file: null,
    children: []
  });

  // Functions to control the addBatteryDialog
  const handleBatteryDialogClose = async (confirmed: boolean, inputValue? : string) => {

    if (!confirmed || !inputValue) {
      setOpenBatteryDialog(false);
      return;
    }

    //Create a new battery to be saved in the backend
    const newBattery: BatteryExercise = {name: inputValue};

    try {

      //Sending the new name for the new batery the will be created
      const response = await fetch(
        "http://localhost:8080/exerciseBatteries",
        {
          method: "POST",
          body: JSON.stringify({
            name: newBattery.name,
          }),
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
        }
      );

      await errorHandler(response, "No tienes permisos para añadir una nueva batería", "Ya existe una batería con ese nombre");

    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.log("Network error: " + error.message);
        enqueueSnackbar(error.message, {
          variant: "error"
        });
      }
      return;

    }finally{
      setOpenBatteryDialog(false);
    }
    //If we reach here without any problems the new battery will be successfully saved
    enqueueSnackbar("Nueva batería guardada satisfactoriamente", {
      variant: "success"
    });

    const newBatteries = [...allExerciseBatteries, newBattery];
    setAllExerciseBatteries(newBatteries);
  };

  const handleBatteryDialogOpen = () => {
    setOpenBatteryDialog(true);
  };
  // Ending of functions to control the addBateryDialog

  // Functions to control the addTagDialog
  const handleTagDialogClose = async (confirmed: boolean, inputValue? : string) => {

    if (!confirmed || !inputValue) {
      setOpenTagDialog(false);
      return;
    }

    //Create a new battery to be saved in the backend
    const newTag: Tag = {name: inputValue};

    try {

      //Sending the new name for the new batery the will be created
      const response = await fetch(
        "http://localhost:8080/tags",
        {
          method: "POST",
          body: JSON.stringify({
            name: newTag.name,
          }),
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
        }
      );

      await errorHandler(response, "No tienes permisos para añadir una nueva tag", "Ya existe una tag con ese nombre");

    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.log("Network error: " + error.message);
        enqueueSnackbar(error.message, {
          variant: "error"
        });
      }
      return;

    }finally{
      setOpenTagDialog(false);
    }

    //If we reach here without any problems the new battery will be successfully saved
    enqueueSnackbar("Nueva tag guardada satisfactoriamente", {
      variant: "success"
    });

    const newTags = [...allTags, newTag];
    setAllTags(newTags);
  };

  const handleTagDialogOpen = () => {
    setOpenTagDialog(true);
  };
  // Ending of functions to control the addTagDialog

  /* ------------------------------------------------------------------------ */

  /* Function that sets the accepted files variable if length is not 0 and are
  accepted beforehand with acceptedFiles from DropzoneExerciseFiles (it checks
  if there is 1 or more files automatically).
  If we needed the rejected files, we would use another variable*/

  const accept = async (acceptedFiles: File[]) => {

    const filesForDisplay:ExerciseFile[] = [];
    const zip = await JSZip.loadAsync(acceptedFiles[0]);
    const isTextFile = (name: string) => {
      const lower = name.toLowerCase();
      return lower.endsWith(".java") || lower.endsWith(".txt") || lower.endsWith(".md");
    }

    let counter = 1;
    for (const path of Object.keys(zip.files)) {
      const file = zip.files[path];

      //If it is a file
      if (file.dir) {
        continue;
      }

      const pathNames = path.split("/");
      const name = pathNames[pathNames.length - 1];

      if (!isTextFile(name)) {
        console.warn("Archivo ignorado:", name);
        continue;
      }

        const content = await file.async("text");

        const exerciseFile:ExerciseFile = {
          id: counter.toString(),
          name: name,
          path: path,
          text: content,
          idFromSolution: null,
          editableMethods: []
        };

        filesForDisplay.push(exerciseFile);
        setTemplateFiles(filesForDisplay);
        counter++;
    }

    if (filesForDisplay.length === 0) {
      enqueueSnackbar("No has subido ningún archivo de texto compatible (.java .txt .md)", {
        variant: "error"
      });
      return;
    }

    //We make a new tree with a new root node
    const newRootNode: MyTreeNode | null = {
      nodeId: "0",
      label: "Exercise",
      file: null,
      children: []
    };

    //Nodes to expand visually (we start for the root node)
    const parentNodeIdList: string[] = [newRootNode.nodeId];

    //Create a new tree
    const newTree = new TreeStructure();
    createTree(newTree, filesForDisplay, newRootNode, parentNodeIdList);

    setRootNode(newRootNode);
    setParentsIdList(parentNodeIdList);
};

  /* ------------------------------------------------------------------------ */

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

          if (responseTags.status === 401 || responseBatteries.status === 401) {
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
          const batteries : BatteryExercise[] = await responseBatteries.json();
          setAllExerciseBatteries(batteries);

          const tags: Tag[] = await responseTags.json();
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

          if (responseExerciseData.status === 401) {
            loginStatus.setIsLogged(false);
            navigate("/login");
            return;
          } else if ( !responseExerciseData.ok) {
            const errorExercise: ErrorSpring = await responseExerciseData.json();
            throw new Error("Error from exercise data on backend - Error " + errorExercise.status + ": " + errorExercise.message);
          }

          const exerciseData: EditorExerciseData = await responseExerciseData.json();

          //If we are editing we see the data and set it
          const exercise: Exercise = {
            id: exerciseData.exercise.id,
            name: exerciseData.exercise.name,
            nameFromBattery: exerciseData.exercise.nameFromBattery,
            statement: exerciseData.exercise.statement,
            requiredRules: exerciseData.exercise.requiredRules,
            forbiddenRules: exerciseData.exercise.forbiddenRules,
            tags: exerciseData.exercise.tags,
          }

          setExercise(exercise);

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

          const myTree = new TreeStructure();

          //Nodes to expand visually (we start for the root node)
          const parentNodeIdList: string[] = [root.nodeId];

          //Create a new tree
          createTree(myTree, newTemplateFiles, root, parentNodeIdList);

          setRootNode(root);
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
      setExercise(prev => {

        return {
          ...prev,
          nameFromBattery: battery.name,
        }
      })
    };

    const handleTagClick = (tagMarcada: Tag) => {
      setExercise(prev => {

        const tags = prev.tags ?? [];

        let newTags: Tag[];

        if (tags.some(tag => tag.name === tagMarcada.name)) {
          newTags = tags.filter(tag => tag.name !== tagMarcada.name);
        } else {
          newTags = [...tags, tagMarcada];
        }

        return {
          ...prev,
          tags: newTags
        };
      });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const controller = new AbortController();

    let method;
    let URI;

    if (isEdit){
      method = "PATCH";
      URI = "http://localhost:8080/exercises/" + exerciseId;
    }else{
      method = "POST";
      URI = "http://localhost:8080/exercises";
    }

    try {
      const response = await fetch(
        URI,
        {
          method: method,
          body: JSON.stringify({
            exercise: {
              ...exercise,
              tags: exercise.tags.map(tag => tag.name),
            },
            files: templateFiles
          }),
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          signal: controller.signal,
        }
      );

      await errorHandler(response,
        "No tienes permisos para crear un nuevo ejercicio",
        "Ya existe un ejercicio con ese nombre y esa batería");
      navigate("/");
      enqueueSnackbar("¡Ejercicio creado correctamente!", {
        variant: "success"
      });

    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.log("Network error: " + error.message);
        enqueueSnackbar(error.message, {
          variant: "error"
        });
      }
      return;
    }
  };

  const ruleProcessing = async (e: React.FormEvent) => {
    e.preventDefault();

    const controller = new AbortController();

    try {
      const response = await fetch(
        "http://localhost:8080/exercises/rules",
        {
          method: "POST",
          body: JSON.stringify({
            rules: { unproccessedRules }
          }),
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          signal: controller.signal,
        }
      );

      if (response.status === 500) {
        throw new Error("Actualmente no podemos procesar sus reglas con esta IA, seleccione otra");
      }else{
        await errorHandler(response, "No tienes permisos para crear nuevas reglas");
      }

      const processedRules: ProcessedRules = await response.json();

      setExercise(prev => {
        return {
          ...prev,
          requiredRules: processedRules.requiredRules,
          forbiddenRules: processedRules.forbiddenRules,
        }
      })

    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.log("Network error: " + error.message);
        enqueueSnackbar(error.message, {
          variant: "error"
        });
      }
      return;
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

      <Box
        sx={{
          position: "sticky",
          top: 40,
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
          zIndex: 10,
          pr: 4,
        }}
      >
        <Button
          onClick={handleSubmit}
          color="success"
          variant="contained"
          size="large"
        >
          <Typography variant="button">
            <strong>Guardar</strong>
          </Typography>
        </Button>
      </Box>

      <form onSubmit={handleSubmit}>
        <Container component="main" sx={{ display: "flex", flexDirection: "column", marginTop: 4, paddingBottom: 12 }}>

          {/* SECCIÓN SUPERIOR: Nombre y Enunciado */}
          <Container maxWidth="sm" sx={{ mb: 4 }}>
            <TextField
              sx={{ marginTop: 1 }}
              margin="normal"
              variant="outlined"
              required
              fullWidth
              multiline
              id="ExerciseName"
              label="Nombre del ejercicio"
              name="ExerciseName"
              autoComplete="ExerciseName"
              value={exercise.name}
              onChange={(e) => {
                setExercise({...exercise, name: e.target.value});
              }}
              autoFocus
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              sx={{ marginTop: 1 }}
              margin="normal"
              variant="outlined"
              required
              fullWidth
              multiline
              id="Statement"
              label="Enunciado del ejercicio"
              name="Statement"
              rows={6}
              autoComplete="Statement"
              value={exercise.statement ?? ""}
              onChange={(e) => {
                setExercise({...exercise, statement: e.target.value});
              }}
            />
          </Container>

          {/* SECCIÓN PRINCIPAL ANCHA */}
          <Container maxWidth="lg">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 900, margin: "0 auto" }}>

              {/* 1. ARCHIVOS (Tamaño compacto y centrado horizontalmente) */}
              <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Box sx={{ maxWidth: 600, width: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Typography variant="h6">Archivos</Typography>
                    <Tooltip
                      title="Debes subir un .zip con los archivos del ejercicio ya con la estructura deseada"
                      slotProps={{ tooltip: { sx: { fontSize: "1rem", maxWidth: 400 } } }}
                    >
                      <IconButton size="small">
                        <Info color="action" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box
                    sx={{
                      border: "2px solid #ccc",
                      borderRadius: 2,
                      px: 4,
                      pt: 3,
                      pb: 4,
                      cursor: "pointer",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      bgcolor: "background.paper"
                    }}
                  >
                    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                      <FileTree
                        expand={true}
                        onNodeSelect={() => null}
                        parents={parentsIdList}
                        nodeId={rootNode?.nodeId}
                        label={rootNode?.label}
                        children={rootNode?.children}
                      />
                    </Box>
                    <DropzoneExerciseFiles handleDrop={accept} />
                  </Box>
                </Box>
              </Box>

              {/* 2. REGLAS (Scroll interno estable y textos autoajustables) */}
              <Box sx={{ width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Typography variant="h6">Reglas</Typography>
                  <Tooltip
                    title="Toda obligación o prohibición que quieras que el ejercicio tenga en cuenta a la hora de examinar el ejercicio, además de que funcione correctamente."
                    slotProps={{ tooltip: { sx: { fontSize: "1rem", maxWidth: 400 } } }}
                  >
                    <IconButton size="small">
                      <Info color="action" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                    alignItems: "stretch",
                    width: "100%"
                  }}
                >
                  {/* Panel Izquierdo: Entrada de texto */}
                  <Paper elevation={2} sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column" }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      Descripción libre
                    </Typography>
                    <TextField
                      multiline
                      rows={14}
                      fullWidth
                      placeholder={"Escribe aquí las reglas del ejercicio...\n\nEj.: los alumnos no deben usar un bucle for, sino un bucle while con la variable 'var'."}
                      onChange={(e) => setUnproccessedRules(e.target.value)}
                    />
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                      <Button
                        variant="contained"
                        startIcon={<AutoAwesomeIcon />}
                        sx={{ width: 220 }}
                        onClick={ruleProcessing}
                      >
                        Procesar
                      </Button>
                    </Box>
                  </Paper>

                  {/* Panel Derecho: Reglas procesadas con scroll de seguridad */}
                  <Paper elevation={2} sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, textAlign: "center" }}>
                      Reglas detectadas
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2, flex: 1, minHeight: 350 }}>

                      {/* Obligaciones */}
                      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, textAlign: "center", opacity: 0.8 }}>
                          Obligaciones
                        </Typography>
                        <Box sx={{ flex: 1, maxHeight: 320, overflowY: "auto", border: "1px dashed #eee", borderRadius: 1 }}>
                          <List dense>
                            {exercise.requiredRules.map((rule, index) => (
                              <ListItem key={index} disablePadding sx={{ px: 1, py: 0.5 }}>
                                <ListItemText
                                  primary={rule.description}
                                  slotProps={{
                                    primary: {
                                      sx: { wordBreak: "break-word", fontSize: "0.875rem" }
                                    }
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Box>

                      <Divider orientation="vertical" flexItem />

                      {/* Prohibiciones */}
                      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, textAlign: "center", opacity: 0.8 }}>
                          Prohibiciones
                        </Typography>
                        <Box sx={{ flex: 1, maxHeight: 320, overflowY: "auto", border: "1px dashed #eee", borderRadius: 1 }}>
                          <List dense>
                            {exercise.forbiddenRules.map((rule, index) => (
                              <ListItem key={index} disablePadding sx={{ px: 1, py: 0.5 }}>
                                <ListItemText
                                  primary={rule.description}
                                  slotProps={{
                                    primary: {
                                      sx: { wordBreak: "break-word", fontSize: "0.875rem" }
                                    }
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Box>

                    </Box>
                  </Paper>
                </Box>
              </Box>

              {/* 3. BATERÍA DE EJERCICIOS */}
              <Box sx={{ width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h6">Batería de Ejercicios</Typography>
                    <Tooltip
                      title="Los ejercicios de la página principal se agruparán en estas categorías"
                      slotProps={{ tooltip: { sx: { fontSize: "1rem", maxWidth: 300 } } }}
                    >
                      <IconButton size="small">
                        <Info color="action" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <IconButton color="primary" onClick={handleBatteryDialogOpen} sx={{ position: "absolute", right: 0 }}>
                    <Add />
                  </IconButton>
                </Box>

                <Box sx={{ border: "2px groove #ccc", borderRadius: 2, p: 2, bgcolor: "background.paper", width: "100%" }}>
                  <nav aria-label="Batteries">
                    <List sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 1 }}>
                      {Array.from(allExerciseBatteries ?? []).map((battery) => (
                        <ListItem key={battery.name} disablePadding>
                          <ListItemButton
                            sx={{ borderRadius: 1, backgroundColor: exercise.nameFromBattery && exercise.nameFromBattery === battery.name ? 'rgba(155, 155, 155, 0.4)' : 'transparent'}}
                            onClick={() => handleExerciseBatteryClick(battery)}
                          >
                            <ListItemText primary={battery.name} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </nav>
                </Box>
              </Box>

              {/* 4. TAGS */}
              <Box sx={{ width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h6">Tags</Typography>
                    <Tooltip
                      title="Estas etiquetas señalan qué tareas se requieren hacer en el ejercicio"
                      slotProps={{ tooltip: { sx: { fontSize: "1rem", maxWidth: 300 } } }}
                    >
                      <IconButton size="small">
                        <Info color="action" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <IconButton color="primary" onClick={handleTagDialogOpen} sx={{ position: "absolute", right: 0 }}>
                    <Add />
                  </IconButton>
                </Box>

                <Box sx={{ border: "2px groove #ccc", borderRadius: 2, p: 2, bgcolor: "background.paper", width: "100%" }}>
                  <List sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 1 }}>
                    {Array.from(allTags ?? []).map((tag) => (
                      <ListItem key={tag.name} disablePadding>
                        <ListItemButton
                          sx={{ borderRadius: 1, backgroundColor: exercise.tags && exercise.tags.some(knownTags => knownTags.name === tag.name) ? 'rgba(155, 155, 155, 0.4)' : 'transparent'}}
                          onClick={() => handleTagClick(tag)}
                        >
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