import React, { useContext, useEffect, useRef, useState } from "react";
import {
  MonacoEditor,
  RangeRestrictionObject,
} from "../components/MonacoEditor";
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
import { Box, Switch } from "@mui/material";
import { LoginContext } from "../Utils";
import { TreeStructure } from "../TreeStructure";
import { MyTab } from "../components/EditorTabs";
import { editor, Uri } from "monaco-editor";
import { Monaco } from "@monaco-editor/react";
import { constrainedEditor } from "constrained-editor-plugin";
import { AlertDialog } from "../components/AlertDialog";
import Typography from "@mui/material/Typography";
import SaveIcon from "@mui/icons-material/Save";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Button from "@mui/material/Button";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import SendIcon from "@mui/icons-material/Send";

export function EditorPage() {
  const location = useLocation();
  const [openSaveDialog, setOpenSaveDialog] = React.useState(false);
  const loginStatus: LoginTypes = useContext(LoginContext);
  const navigate = useNavigate();
  const [exerciseName, setExerciseName] = useState<string>();
  const [exerciseId, setExerciseId] = useState<string>();
  const [currentSolutionId, setCurrentSolutionId] = useState<string | null>(
    null
  );
  const [batteryName, setBatteryName] = useState<string>();
  const [templateFiles, setTemplateFiles] = useState<ExerciseFile[]>();
  const [tabs, setTabs] = useState<MyTab[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [parentsIdList, setParentsIdList] = useState<string[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [autosave, setAutosave] = useState<boolean>(true);
  const [isButtonSmall, setIsButtonSmall] = useState<boolean>(false);
  const [fileTree, setFileTree] = useState<TreeStructure>();
  const [editorValue, setEditorValue] = useState<string>();
  const [rootNode, setRootNode] = useState<MyTreeNode>({
    nodeId: "0",
    label: "Exercise",
    file: null,
    children: [],
  });
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const restrictions: RangeRestrictionObject[] = [];

  const handleDialogClose = () => {
    setOpenSaveDialog(false);
  };

  const handleDialogOpen = () => {
    setOpenSaveDialog(true);
  };

  const handleManualSave = () => {
    const displayFiles: Array<ExerciseFile> = [];
    fileTree?.filterLeafNodes(displayFiles);

    const saveData = async () => {
      try {
        const response = await fetch("http://localhost:8080/solutions/save", {
          method: "PUT",
          body: JSON.stringify({
            filesForDisplay: displayFiles,
            exerciseId: exerciseId,
            solutionId: currentSolutionId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorExercise: ErrorSpring = await response.json();
          throw new Error("Error from backend - " + errorExercise.message);
        }

        //TODO AQUI VA LA RESPUESTA OK
        //TODO SNACKBAR AVISANDO DE QUE TODOS LOS CAMBIOS SE HAN GUARDADO CON ÉXITO
      } catch (error: any) {
        console.log("Network error");
      }
    };
    saveData();
  };

  const handleAutosave = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutosave(event.target.checked);
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

  const handleEditorChange = (content: string | undefined) => {
    const auxTabs = [...tabs];
    const tab = auxTabs[activeTab];

    if (tab && tab.node.file && content) {
      const path = Uri.parse(tab.node.file.path);
      editor.getModel(path)?.setValue(content);
      tab.node.file.content = content;
    }

    setTabs(auxTabs);
    setUnsavedChanges(false);
  };

  function handleEditorDidMount(
    codeEditor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    editorRef.current = codeEditor;

    const constrainedInstance = constrainedEditor(monaco);
    const model = codeEditor.getModel();

    constrainedInstance.initializeIn(codeEditor);
    // restrictions.push({
    //   range: [1, 1, 2, 10],
    //   allowMultiline: true,
    // });
    // constrainedInstance.addRestrictionsTo(model, restrictions);
  }

  const handleNodeSelect = (
    _event: React.SyntheticEvent,
    nodeIds: Array<string> | string
  ) => {
    const selectedNodeId = Array.isArray(nodeIds) ? nodeIds[0] : nodeIds;
    if (fileTree === undefined) {
      /*TODO qué hacer si el arbol no se ha generado todavía? Querría decir que
      el fetch no se ha realizado y sin embargo se ha seleccionado un nodo
      no tiene sentido*/
      return;
    }

    //If the selected node is not a file It does nothing
    const selectedNode = fileTree.findNodeById(selectedNodeId);
    if (!selectedNode?.file) {
      return;
    }

    //If the selected node already has a corresponding tab It does nothing
    for (const tab of tabs) {
      if (tab.node.nodeId === selectedNodeId) {
        return;
      }
    }

    const newTabs = [...tabs];

    const newTab: MyTab = {
      node: selectedNode,
    };

    //If the model already exist for that file it will use it, if not, it will create a new one
    const model = editor.getModel(Uri.parse(selectedNode.file.path));

    if (!model) {
      editor.createModel(
        selectedNode.file.content,
        "java",
        Uri.parse(selectedNode.file.path)
      );
    }

    newTabs.push(newTab);
    setTabs(newTabs);

    setUnsavedChanges(false);
  };

  const handleSubmit = () => {
    //TODO ENVIAR NODOS DEL ÁRBOL (SOLO DE SOLUCIÓN)
  };

  //Fetching files for the editor to show and setting up states and file tree
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
        setTemplateFiles(data.templateFiles);
        setCurrentSolutionId(data.currentSolution);

        const filesForDisplay = data.filesForDisplay;

        const root: MyTreeNode | null = {
          nodeId: "0",
          label: "Exercise",
          file: null,
          children: [],
        };

        const myTree = new TreeStructure();
        myTree.addNode(root);

        const filesAndDirectories: string[] = [];
        const parentNodeIdList: string[] = ["0"];
        let counter = 1;

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
      } catch (error: any) {
        console.log("Network error");
      }
    };
    fetchData();
  }, [location.pathname]);

  const handleAllotmentChange = (sizes: number[]) => {
    sizes[2] < 325 ? setIsButtonSmall(true) : setIsButtonSmall(false);
  };

  return (
    <>
      <AlertDialog open={openSaveDialog} handleClose={handleDialogClose} />
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <MyBreadcrumbs exerciseName={exerciseName} batteryName={batteryName} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginRight: "25px",
            marginTop: "10px",
          }}
        >
          <Button
            sx={{ marginRight: "20px" }}
            color="secondary"
            variant="contained"
            onClick={handleManualSave}
          >
            <Typography variant="button">
              <strong>SAVE ALL</strong>
            </Typography>
          </Button>
          <SaveIcon sx={{ mr: 0.5 }} fontSize="medium" />
          <Typography variant="button">
            <strong>AUTOSAVE</strong>
          </Typography>
          <Switch onChange={handleAutosave} checked={autosave} />
        </Box>
      </Box>
      <Box className="editor-page">
        <Allotment onChange={handleAllotmentChange}>
          <Allotment.Pane minSize={150} snap>
            <Box>{rootNode?.label}</Box>

            <Button
              onClick={handleSubmit}
              color="success"
              variant="contained"
              endIcon={<SendIcon />}
            >
              <Typography variant="button">
                <strong>Submit solution</strong>
              </Typography>
            </Button>
          </Allotment.Pane>
          <Box padding="0px 20px 0px 20px">
            <Allotment.Pane visible snap>
              <MonacoEditor
                path={tabs[activeTab]?.node.file?.path ?? "/"}
                tabs={tabs}
                activeTab={activeTab}
                onTabClick={handleTabClick}
                onCloseClick={handleCloseTab}
                onValueChange={handleEditorChange}
                onEditorDidMount={handleEditorDidMount}
              />
            </Allotment.Pane>
          </Box>
          <Allotment.Pane preferredSize="25%" minSize={150} snap>
            <Box className="fileTree">
              <FileTree
                onNodeSelect={handleNodeSelect}
                parents={parentsIdList}
                nodeId={rootNode?.nodeId}
                label={rootNode?.label}
                children={rootNode?.children}
              />
              <Box
                className="download-buttons"
                sx={{
                  flexDirection: isButtonSmall ? "column" : "row",
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<DownloadOutlinedIcon />}
                >
                  <Typography variant="button">Download File</Typography>
                </Button>
                <Button variant="contained" startIcon={<FolderZipIcon />}>
                  Download All
                </Button>
              </Box>
            </Box>
          </Allotment.Pane>
        </Allotment>
      </Box>
    </>
  );
}
