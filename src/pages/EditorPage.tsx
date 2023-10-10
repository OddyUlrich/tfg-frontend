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
import { Box } from "@mui/material";
import { LoginContext } from "../Utils";
import { TreeStructure } from "../TreeStructure";
import { MyTab } from "../components/EditorTabs";
import { editor, Uri } from "monaco-editor";
import { Monaco } from "@monaco-editor/react";
import { constrainedEditor } from "constrained-editor-plugin";

const templateText =
  "//Selecciona uno de los archivos de la derecha para verlo y, si es posible, editarlo.\n//Select one of the files on the right to view it here and, if possible, edit it.\n";

const initialTabs: MyTab[] = [
  {
    node: {
      nodeId: "9999",
      label: "Instructions",
      file: {
        id: "0",
        name: "Instructions",
        path: "/Instructions",
        content: templateText,
        idFromSolution: null,
        editableMethods: null,
      },
      children: [],
    },
    modelMonacoEditor: null,
  },
  {
    node: {
      nodeId: "9998",
      label: "Prueba",
      file: {
        id: "0",
        name: "Prueba",
        path: "/Prueba",
        content: "Prueba de texto diferente",
        idFromSolution: null,
        editableMethods: null,
      },
      children: [],
    },
    modelMonacoEditor: null,
  },
];

export function EditorPage() {
  const location = useLocation();
  const loginStatus: LoginTypes = useContext(LoginContext);
  const navigate = useNavigate();
  const [exerciseName, setExerciseName] = useState<string>();
  const [exerciseId, setExerciseId] = useState<string>();
  const [batteryName, setBatteryName] = useState<string>();
  const [templateFiles, setFreshFiles] = useState<ExerciseFile[]>();
  const [tabs, setTabs] = useState<MyTab[]>(initialTabs);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [parentsIdList, setParentsIdList] = useState<string[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
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

  const handleTabClick = (event: React.SyntheticEvent, index: number) => {
    setActiveTab(index);
  };

  const handleCloseTab = (index: number) => {
    const newTabs = [...tabs];
    if (index > -1) {
      newTabs.splice(index, 1);
    }
    setTabs(newTabs);
  };

  const handleEditorChange = (value: string | undefined) => {
    setUnsavedChanges(false);
  };

  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    editorRef.current = editor;

    const constrainedInstance = constrainedEditor(monaco);
    const model = editor.getModel();

    constrainedInstance.initializeIn(editor);
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
    const model = editor.getModel(Uri.parse(selectedNode.file.path));

    //If the model already exist for that file it will use it, if not, it will create a new one
    const newTab: MyTab = {
      node: selectedNode,
      modelMonacoEditor:
        model ??
        editor.createModel(
          selectedNode.file.content,
          "java",
          Uri.parse(selectedNode.file.path)
        ),
    };

    newTabs.push(newTab);
    setTabs(newTabs);

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
        setFreshFiles(data.templateFiles);

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
        /*TODO: queda pendiente ver qué hacer si el ejercicio no existe, literalmente poner texto
        de ejemplo diciendo que seleccionemos un objeto en el árbol de ficheros*/
      }
    };
    fetchData();
  }, [location.pathname]);

  return (
    <>
      <MyBreadcrumbs exerciseName={exerciseName} batteryName={batteryName} />
      <Box className="editor-page">
        <Allotment>
          <Allotment.Pane snap>
            <Box>{rootNode?.label}</Box>
          </Allotment.Pane>
          <Box padding="0px 20px 0px 20px">
            <Allotment.Pane visible snap>
              <MonacoEditor
                defaultValue={
                  tabs[activeTab]?.node.file?.content ?? "Loading..."
                }
                path={tabs[activeTab]?.node.file?.path ?? "/Instructions"}
                tabs={tabs}
                activeTab={activeTab}
                onTabClick={handleTabClick}
                onCloseClick={handleCloseTab}
                onValueChange={handleEditorChange}
                onEditorDidMount={handleEditorDidMount}
              />
            </Allotment.Pane>
          </Box>
          <Allotment.Pane preferredSize="25%" minSize={100} snap>
            <Box className="fileTree">
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
