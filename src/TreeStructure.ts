import { MyTreeNode } from "./Types";

export class MyTree {
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

  preOrderTraversal(callback: (node: MyTreeNode) => void) {
    const traverse = (node: MyTreeNode | null) => {
      if (node) {
        callback(node);
        node.children.forEach((child) => {
          traverse(child);
        });
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
}
