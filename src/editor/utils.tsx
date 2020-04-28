import { AbstractNode } from "./AbstractNode";
import { AbstractPosition } from "./types";

export function randomId() {
  return Math.random().toString(36).substr(2);
}

export type TargetFinder<T> = (node: Node) => void | T;

export function findTargetFromDOM<T>(node: Node, finder: TargetFinder<T>) {
  let p: Node | null = node;
  while (p) {
    const result = finder(p);
    if (result !== undefined) {
      return result;
    }
    p = p.parentElement;
  }
  return undefined;
}

export function findAbstractNodeFromDOM(node: Node) {
  return findTargetFromDOM(
    node,
    node => '__ABSTRACT__' in node ? (node as any).__ABSTRACT__ as AbstractNode : undefined,
  );
}

export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg || `assert: ${condition}`);
  }
}

export function findAbstractNode(node: AbstractNode, target: AbstractNode) {
  let p: AbstractNode | null = node;
  while (p) {
    if (p === target) {
      return target;
    }
    p = p.parent;
  }
}

export function isPartialShallowEqual(partial: any, origin: any, all = false): boolean {
  if (Object.is(partial, origin)) {
    return true;
  }

  if (
    typeof partial !== 'object' ||
    partial === null ||
    typeof origin !== 'object' ||
    origin === null
  ) {
    return false;
  }

  const keysA = Object.keys(partial);
  const keysB = Object.keys(origin);

  if (all && keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(origin, key) ||
      !Object.is(partial[key], origin[key])
    ) {
      return false;
    }
  }

  return true;
}

  
export function getAbstractNodePath(from: AbstractNode, to?: AbstractNode) {
  const path: AbstractNode[] = [];
  let p: AbstractNode | null = from;
  while (p) {
    path.push(p);
    if (p === to) {
      break;
    }
    p = p.parent;
  }
  return path.reverse();
}

export function compareAbstractPosition(node1: AbstractNode, node2: AbstractNode): AbstractPosition {
  if (node1 === node2) {
    return AbstractPosition.Same;
  }
  const path1 = getAbstractNodePath(node1);
  const path2 = getAbstractNodePath(node2);

  if (path1[0] !== path2[0]) {
    return AbstractPosition.Disconnected;
  }

  const minLength = Math.min(path1.length, path2.length);
  for (let i = 0; i < minLength; i++) {
    const n1 = path1[i];
    const n2 = path2[i];
    if (n1 !== n2) {
      const { abstractNodes } = path1[i - 1];
      assert(abstractNodes);
      const index1 = abstractNodes.indexOf(n1);
      const index2 = abstractNodes.indexOf(n2);
      return index1 <= index2 ? AbstractPosition.Following : AbstractPosition.Preceding;
    }
  }
  return path1.length <= path2.length ? AbstractPosition.ContainedBy : AbstractPosition.Contains;
}