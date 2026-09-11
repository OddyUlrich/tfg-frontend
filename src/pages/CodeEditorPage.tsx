import React, { useEffect, useRef, useState } from "react";
import {
  MonacoEditor,
  RangeRestrictionObject
} from "../components/MonacoEditor";
import { MyBreadcrumbs } from "../components/navigation/MyBreadcrumbs";
import {
  CodeEditorData,
  ErrorSpring, EvaluationResponse, Exercise,
  ExerciseFile,
  MyTreeNode
} from "../Types";
import { useLocation, useParams } from "react-router-dom";
import { Allotment } from "allotment";
import { createTree, FileTree } from "../components/tree/FileTree";
import { Box, Chip, CircularProgress, Divider, Switch } from "@mui/material";
import { TreeStructure } from "../TreeStructure";
import { MyTab } from "../components/EditorTabs";
import { editor, Uri } from "monaco-editor";
import { Monaco } from "@monaco-editor/react";
import { constrainedEditor } from "constrained-editor-plugin";
import { AlertDialog } from "../components/dialogs/AlertDialog";
import Typography from "@mui/material/Typography";
import SaveIcon from "@mui/icons-material/Save";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Button from "@mui/material/Button";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import SendIcon from "@mui/icons-material/Send";
import { Done } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import TextField from "@mui/material/TextField";
import { useErrorHandler } from "../Utils";


const EMPTY_RESTRICTIONS: RangeRestrictionObject[] = [];

export function CodeEditorPage() {
  const location = useLocation();
  const errorHandler = useErrorHandler();
  const [openSaveDialog, setOpenSaveDialog] = React.useState(false);
  const [currentSolutionId, setCurrentSolutionId] = useState<string | null>(
    null
  );
  const [templateFiles, setTemplateFiles] = useState<ExerciseFile[]>();
  const [tabs, setTabs] = useState<MyTab[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [parentsIdList, setParentsIdList] = useState<string[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [autosave, setAutosave] = useState<boolean>(true);
  const [isButtonSmall, setIsButtonSmall] = useState<boolean>(false);
  const [fileTree, setfileTree] = useState<TreeStructure>();
  const [rootNode, setRootNode] = useState<MyTreeNode>({
    nodeId: "0",
    label: "Exercise",
    file: null,
    children: []
  });

  const [exercise, setExercise] = useState<Exercise>({
    id: null,
    name: "",
    statement: "",
    nameFromBattery: "",
    rules: [],
    tags: [],
  });

  //IA variables
  const [IAResponse, setIAResponse] = useState<string>();

  //Code editor variables
  const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const constrainedInstance = useRef<any>(null);
  const restrictionsByModel = useRef(new Map<string, RangeRestrictionObject[]>());
  const decorationsByModel = useRef(new Map<string, editor.IModelDeltaDecoration[]>());
  const decorationIdsByModel = useRef(new Map<string, string[]>());
  const initializedModels = useRef(new Set<string>());

  //Route params
  const { exerciseId } = useParams<{exerciseId: string}>();

  //Separations
  const handleAllotmentChange = (sizes: number[]) => {
    sizes[2] < 325 ? setIsButtonSmall(true) : setIsButtonSmall(false);
  };

  //Dialog handlers
  const handleDialogClose = () => {
    setOpenSaveDialog(false);
  };

  const handleDialogOpen = () => {
    setOpenSaveDialog(true);
  };

  //Fetching files for the editor to show and setting up states and file tree
  useEffect(() => {

    if (!monacoInstance) return;

    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/exercises/${exerciseId}/solutions`,
          {
            method: "GET",
            credentials: "include"
          }
        );

        if (!response.ok) {
          const errorExercise: ErrorSpring = await response.json();
          throw new Error("Error from backend - " + errorExercise.message);
        }

        const data: CodeEditorData = await response.json();

        setTemplateFiles(data.templateFiles);
        setCurrentSolutionId(data.currentSolution);
        setExercise(data.exercise);

        const filesForDisplay = data.filesForDisplay;

        for (const file of filesForDisplay) {
          const uri = monacoInstance.Uri.parse(file.path);

          //Creating the models with their respective text
          let model = monacoInstance.editor.getModel(uri);

          if (!model) {

            model = monacoInstance.editor.createModel(
              file.text,
              "java",
              uri
            );
          }


          //Creating the restrictions for editable methods

          if (file && file.editableMethods && file.editableMethods.length > 0){
            const restrictions:RangeRestrictionObject[] = [];
            for (const method of file.editableMethods) {
              restrictions.push({
                range: [
                  method.startLine,
                  1,
                  method.endLine,
                  monacoInstance.editor.getModel(uri)?.getLineMaxColumn(method.endLine) ?? 1,
                ],
                allowMultiline: true
              });
            }


            restrictionsByModel.current.set(uri.path, restrictions);

            const decorations: editor.IModelDeltaDecoration[] = [];
            const methods = [...file.editableMethods].sort(
              (a, b) => a.startLine - b.startLine
            );

            const lineCount = model.getLineCount();
            let currentLine = 1;

            for (const method of methods) {
              const blockEnd = method.startLine - 2;

              if (currentLine <= blockEnd) {
                decorations.push({
                  range: new monacoInstance.Range(
                    currentLine,
                    1,
                    blockEnd,
                    model.getLineMaxColumn(blockEnd)
                  ),
                  options: {
                    isWholeLine: true,
                    className: "readonlyBlock",
                    inlineClassName: "readonlyText",
                    linesDecorationsClassName: "readonlyMargin",
                    stickiness: monacoInstance.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                  }
                });
              }
              currentLine = method.endLine + 2;
            }

            if (currentLine <= lineCount) {
              decorations.push({
                range: new monacoInstance.Range(
                  currentLine,
                  1,
                  lineCount,
                  model.getLineMaxColumn(lineCount)
                ),
                options: {
                  isWholeLine: true,
                  className: "readonlyBlock",
                  inlineClassName: "readonlyText",
                  linesDecorationsClassName: "readonlyMargin",
                  stickiness: monacoInstance.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                }
              });
            }

            decorationsByModel.current.set(uri.path, decorations);

            if (initializedModels.current.has(uri.path)) {
              constrainedInstance.current.removeRestrictionsIn(model);
            }
            constrainedInstance.current.addRestrictionsTo(model, restrictions);
            initializedModels.current.add(uri.path);

            const previousIds = decorationIdsByModel.current.get(uri.path) ?? [];
            const newIds = model.deltaDecorations(previousIds, decorations);
            decorationIdsByModel.current.set(uri.path, newIds);
          }else{

            restrictionsByModel.current.set(uri.path, EMPTY_RESTRICTIONS);

            if (initializedModels.current.has(uri.path)) {
              constrainedInstance.current.removeRestrictionsIn(model);
            }
            constrainedInstance.current.addRestrictionsTo(model, EMPTY_RESTRICTIONS);
            initializedModels.current.add(uri.path);

            const lineCount = model.getLineCount();
            const fullFileDecoration: editor.IModelDeltaDecoration[] = [
              {
                range: new monacoInstance.Range(
                  1,
                  1,
                  lineCount,
                  model.getLineMaxColumn(lineCount)
                ),
                options: {
                  isWholeLine: true,
                  className: "readonlyBlock",
                  inlineClassName: "readonlyText",
                  linesDecorationsClassName: "readonlyMargin",
                  stickiness: monacoInstance.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                }
              }
            ];

            decorationsByModel.current.set(uri.path, fullFileDecoration);

            const previousIds = decorationIdsByModel.current.get(uri.path) ?? [];
            const newIds = model.deltaDecorations(previousIds, fullFileDecoration);
            decorationIdsByModel.current.set(uri.path, newIds);
          }
        }

        const root: MyTreeNode | null = {
          nodeId: "0",
          label: "Exercise",
          file: null,
          children: []
        };

        const myTree = new TreeStructure();
        myTree.addNode(root);

        //Nodos a expandir (padres)
        const parentNodeIdList: string[] = [root.nodeId];

        createTree(myTree, filesForDisplay, root, parentNodeIdList);

        setRootNode(root);
        setfileTree(myTree);
        setParentsIdList(parentNodeIdList);

      } catch (error: any) {
        console.log("Network error: " + error.message);
      }
    };
    void fetchData();
  }, [location.pathname, monacoInstance]);


  const handleEditorChange = (content: string | undefined) => {
    setUnsavedChanges(true);

    if (!autosave) return;

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(() => {
      handleSave(false);
    }, 3000);

  };

  /*--------------------------------------------------*/
  // TABS RELATED FUNCTIONS

  const handleTabClick = (event: React.SyntheticEvent, index: number) => {
    setActiveTab(index);
  };

  const handleCloseTab = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    event.stopPropagation();


    const newTabs = [...tabs];
    if (index > -1) {
      newTabs.splice(index, 1);
    }

    if (activeTab === tabs.length - 1 && activeTab > 0) {
      setActiveTab(activeTab - 1);
    }

    setTabs(newTabs);
  };

  /*------------------------------------------------*/
  // HANDLERS

  function handleEditorDidMount(
    codeEditor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    editorRef.current = codeEditor;
    setMonacoInstance(monaco);

    constrainedInstance.current = constrainedEditor(monaco);
    constrainedInstance.current.initializeIn(codeEditor);
  }

  const handleStatusAutosave = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutosave(event.target.checked);

    if (event.target.checked) {
      handleSave(false);
    }
  };

  //Function for handling the event of selecting a node from the tree
  const handleNodeSelect = (
    _event: React.SyntheticEvent | null,
    nodeId: string | null
  ) => {

    //We don't check the event cause this function could be called by a component and not the user
    if (fileTree === undefined || nodeId === null) {
      console.warn("Tree not declared");
      return;
    }

    const selectedNode = fileTree.findNodeById(nodeId);

    //If the selected node is not a file, it does nothing
    if (!selectedNode?.file) {
      return;
    }

    const newTabs = [...tabs];

    //If the selected node already has a corresponding tab, it does nothing
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].node.nodeId === nodeId) {
        setActiveTab(i);
        return;
      }
    }

    //Create a new tab with the selected node to show the file
    const newTab: MyTab = {
      node: selectedNode
    };

    //Now we add the new tab in the list of tabs
    newTabs.push(newTab);
    setTabs(newTabs);

    //Select this new tab to show the content instantly
    setActiveTab(newTabs.length - 1);
  };

  //Upload the solution files to get a correction and a number of errors
  const handleSubmit = () => {
    //TODO ENVIAR NODOS DEL ÁRBOL (SOLO DE SOLUCIÓN)
  };

  /* ----------------------------------------------- */
  // SAVE FUNCTION

  //Auto-save handle (3 seconds)
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSave = (buttonPressed: boolean) => {
    const solutionFiles: Array<ExerciseFile> = [];
    fileTree?.filterSolutionNodes(solutionFiles);

    solutionFiles.forEach((file) => {
      const model = monacoInstance?.editor.getModel(Uri.parse(file.path));
      if (model) {
        file.text = model.getValue();
      }
    });

    const saveData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/exercises/${exerciseId}/solutions`, {
          method: "POST",
          body: JSON.stringify({
            solutionFiles: solutionFiles,
            solutionId: currentSolutionId
          }),
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });

        if (!response.ok) {
          const errorExercise: ErrorSpring = await response.json();
          throw new Error("Error from backend - " + errorExercise.message);
        }

        setUnsavedChanges(false);


        if (buttonPressed) {
          enqueueSnackbar("Se ha guardado todo correctamente", {
            variant: "success"
          });
        }


      } catch (error: any) {
        if (error instanceof Error) {
          console.log(error.message);
        }
      }
    };
    void saveData();
  };

  //Clean-up function so no timeout lasts even in page changes
  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, []);

  /* ----------------------------------------------- */
  //EVALUATION WITH AI FUNCTION

  const handleEvaluation = () => {
    const filesForEvaluation: Array<ExerciseFile> | undefined =  templateFiles?.map(file => ({ ...file }));

    //We loop all the template files and overwrite the solution files with the current content in the models
    filesForEvaluation?.forEach((file) => {
      if (file.editableMethods && file.editableMethods.length > 0){

        const model = monacoInstance?.editor.getModel(Uri.parse(file.path));
        if (model) {
          file.text = model.getValue();
        }
      }
    });

    const evaluate = async () => {
      try {
        const response = await fetch(`http://localhost:8080/exercises/${exerciseId}/solutions/evaluate`, {
          method: "POST",
          body: JSON.stringify({
            filesForEvaluation: filesForEvaluation,
            statement: exercise.statement,
            rules: exercise.rules,
            solutionId: currentSolutionId
          }),
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include"
        });

        if (response.status === 503) {
          throw new Error("Actualmente no podemos procesar sus reglas con esta IA");
        }else{
          await errorHandler(response, "No tienes permisos para crear nuevas reglas");
        }

        const evaluationResponse: EvaluationResponse = await response.json();
        const evaluationString: string[] = [];

        if (evaluationResponse.evaluationStatus === "PASS"){
          evaluationString.push("APTO:\n");
        }else if(evaluationResponse.evaluationStatus === "FAIL"){
          evaluationString.push("NO APTO:\n");
        }else{
          evaluationString.push("SIN EVALUACIÓN:\n");
        }

        evaluationString.push(evaluationResponse.response);

        if (evaluationResponse.errors.length > 0) {
          evaluationString.push("\n\nErrores:\n");
        }
        evaluationResponse.errors.forEach((error: string) => {
          evaluationString.push(`-  ${error}\n`);
        })

        const evaluationText = evaluationString.join("");
        setIAResponse(evaluationText);

      } catch (error: any) {
        if (error instanceof Error) {
          console.log(error.message);
        }
      }
    };
    void evaluate();
  };

  /* ----------------------------------------------- */
  // RENDER

  let saveStatusIcon;
  if (autosave && unsavedChanges) {
    saveStatusIcon = <CircularProgress sx={{ marginRight: "10px" }} size={24} />;
  } else if (autosave && !unsavedChanges) {
    saveStatusIcon = <Done sx={{ marginRight: "10px" }} color="success" />;
  } else {
    saveStatusIcon = null;
  }


  return (
    <>
      <AlertDialog open={openSaveDialog} handleClose={handleDialogClose} />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <MyBreadcrumbs exerciseName={exercise.name} batteryName={exercise.nameFromBattery} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginRight: "25px",
            marginTop: "10px"
          }}
        >
          <Button
            sx={{ marginRight: "20px" }}
            color="primary"
            variant="contained"
            onClick={() => handleSave(true)}
          >
            <Typography variant="button">
              <strong>SAVE ALL</strong>
            </Typography>
          </Button>
          {saveStatusIcon}
          <SaveIcon sx={{ mr: 0.5 }} fontSize="medium" />
          <Typography variant="button">
            <strong>AUTOSAVE</strong>
          </Typography>
          <Switch onChange={handleStatusAutosave} checked={autosave} />
        </Box>
      </Box>
      <Box className="editor-page">
        <Allotment onChange={handleAllotmentChange}>
          <Allotment.Pane minSize={250} preferredSize="25%" snap>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: 2,
                boxSizing: "border-box",
                overflowY: "auto",
                backgroundColor: theme => theme.palette.mode === "dark" ? "#1e1e1e" : "#fafafa",
                borderRight: "1px solid #ced4da"
              }}
            >
              {/* SECCIÓN SUPERIOR: Información del ejercicio */}
              <Box sx={{ m:2 }}>
                {/* Título del Ejercicio */}
                <Typography variant="h5" component="h2" sx={{ fontWeight: "bold", mb: 1 }}>
                  {exercise.name}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                {/* Enunciado */}
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                  Enunciado:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "justify" }}>
                  {exercise.statement}
                </Typography>

                {/* REGLAS OBLIGATORIAS */}
                {exercise.rules && exercise.rules.filter((rule) => (rule.type === "REQUIRED")).length > 0 && (
                  <Box sx={{ mb: 3 }} >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: "bold",
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1
                      }}
                    >
                      <Chip
                        label="Obligatorio"
                        color="success"
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          height: 20
                        }}
                      />
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, margin: 0, mb: 3, color: "text.secondary", fontSize: "0.875rem" }}>
                      {exercise?.rules?.filter((rule) => (rule.type === "REQUIRED"))?.map((rule, index) => (
                        <Box component="li" key={index} sx={{ mb: 0.5 }}>
                          {rule.description}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* PROHIBICIONES */}
                {exercise.rules && exercise.rules.filter((rule) => (rule.type === "FORBIDDEN")).length > 0 && (
                  <Box sx={{ mb: 3 }} >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: "bold",
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1
                      }}
                    >
                      <Chip
                        label="Prohibido"
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          height: 20,
                          backgroundColor: theme => theme.palette.mode === "dark" ? "#5a1818" : "#901a1a",
                          color: "#ffffff"
                        }}
                      />
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, margin: 0, mb: 3, color: "text.secondary", fontSize: "0.875rem" }}>
                      {exercise?.rules?.filter((rule) => (rule.type === "FORBIDDEN"))?.map((rule, index) => (
                        <Box component="li" key={index} sx={{ mb: 0.5 }}>
                          {rule.description}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  )}
              </Box>

              <Box sx={{ mt: "auto" }}>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  ✨ Asistente IA:
                </Typography>
                <TextField
                  multiline
                  minRows={6}
                  maxRows={12}
                  fullWidth
                  variant="outlined"
                  placeholder="La respuesta del análisis de la IA aparecerá aquí tras pulsar Examinar..."
                  value={IAResponse}
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                  sx={{
                    mb: 1.5,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: theme => theme.palette.mode === "dark" ? "#2d2d2d" : "#fff",
                      fontSize: "0.85rem",
                      fontFamily: "monospace"
                    }
                  }}
                />

                {/* Botones de acción */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button
                    fullWidth
                    onClick={() => handleEvaluation()}
                    color="secondary"
                    variant="outlined"
                    sx={{ fontWeight: "bold", textTransform: "none" }}
                  >
                    Examinar
                  </Button>

                  <Button
                    fullWidth
                    onClick={handleSubmit}
                    color="success"
                    variant="contained"
                    endIcon={<SendIcon />}
                    sx={{ fontWeight: "bold", textTransform: "none" }}
                  >
                    Submit solution
                  </Button>
                </Box>
              </Box>
            </Box>
          </Allotment.Pane>
          <Allotment.Pane visible snap>
            <Box
              sx={{
                height: "100%",
                width: "100%",
                px: 2,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              <MonacoEditor
                  path={tabs[activeTab]?.node.file?.path ?? "/"}
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabClick={handleTabClick}
                  onCloseClick={handleCloseTab}
                  onValueChange={handleEditorChange}
                  onEditorDidMount={handleEditorDidMount}
                />
            </Box>
          </Allotment.Pane>
          <Allotment.Pane preferredSize="25%" minSize={150} snap>
            <Box className="file-pane">
              <Box className="file-selector"
              >
                <FileTree
                  expand={true}
                  onNodeSelect={handleNodeSelect}
                  parents={parentsIdList}
                  nodeId={rootNode?.nodeId}
                  label={rootNode?.label}
                  children={rootNode?.children}
                />
                <Box
                  className="download-buttons"
                >
                  <Button
                    sx={{ borderRadius: "5px" }}
                    color="primary"
                    variant="contained"
                    startIcon={<DownloadOutlinedIcon />}
                  >
                    <Typography sx={{ fontWeight: "bold" }}
                                variant="button">{!isButtonSmall ? "Download File" : "File"}</Typography>
                  </Button>
                  <Button
                    sx={{ borderRadius: "5px" }}
                    color="primary"
                    variant="contained"
                    startIcon={<FolderZipIcon />}>
                    <Typography sx={{ fontWeight: "bold" }}
                                variant="button"> {!isButtonSmall ? "Download All" : "All"}</Typography>
                  </Button>
                </Box>
              </Box>
            </Box>
          </Allotment.Pane>
        </Allotment>
      </Box>
    </>
  );
}
