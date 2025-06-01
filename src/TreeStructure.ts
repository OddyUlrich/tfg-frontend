import { ExerciseFile, MyTreeNode } from "./Types";

export class TreeStructure {
  private root: MyTreeNode | null;

  constructor() {
    this.root = null;
  }

  addNode(node: MyTreeNode, parent: MyTreeNode | null = null) {
    if (!this.root) {
      this.root = node;
    } else if (parent) {
      parent.children.push(node);
    }
  }

  filterSolutionNodes(list: Array<ExerciseFile>) {
    const traverse = (node: MyTreeNode | null) => {
      if (node) {
        if (
          node.children.length === 0 &&
          node.file?.editableMethods &&
          node.file.editableMethods.length > 0
        ) {
          list.push(node.file);
        } else {
          node.children.forEach((child) => {
            traverse(child);
          });
        }
      }
    };

    traverse(this.root);
  }

  findNodeByLabel(label: string): MyTreeNode | null {
    let foundNode: MyTreeNode | null = null;

    const traverse = (node: MyTreeNode | null) => {
      if (node) {
        if (node.label === label) {
          foundNode = node;
          return;
        }
        node.children.forEach((child) => {
          traverse(child);
        });
      }
    };

    traverse(this.root);
    return foundNode;
  }

  findNodeById(id: string): MyTreeNode | null {
    let foundNode: MyTreeNode | null = null;

    const traverse = (node: MyTreeNode | null) => {
      if (node) {
        if (node.nodeId === id) {
          foundNode = node;
          return;
        }
        node.children.forEach((child) => {
          traverse(child);
        });
      }
    };

    traverse(this.root);
    return foundNode;
  }
}
