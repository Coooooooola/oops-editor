import { DocType, CaptureCallback, BubbleCallback, Writable, NonEmptyArray, AbstractPosition } from "./types";
import { isPartialShallowEqual, assert, getAbstractNodePath, compareAbstractPosition } from "./utils";
import { AbstractEvent } from "./AbstractEvent";
import { AbstractBaseEvent } from "./AbstractBaseEvent";

export type AnyAbstractNode<K extends DocType = DocType> = AbstractNode<K>;

export interface AbstractNode<
  K extends DocType,
  T extends { [key: string]: any } = any,
  P extends NonEmptyArray<AnyAbstractNode> = NonEmptyArray<AnyAbstractNode>,
  U extends { [key: string]: any } = any,
> {
  readonly type: K;
  readonly id: string;

  readonly data?: T;
  readonly abstractNodes?: P;

  readonly parent?: AnyAbstractNode;

  render?(data: T): void;
  renderAbstractNodes?(abstractNodes?: P): void;

  state?: U;

  batch?: {
    data?: T;
    abstractNodes?: P;
  };
}

export function linkAbstractNode(root: AnyAbstractNode) {
  const { abstractNodes } = root;
  if (abstractNodes) {
    for (const node of abstractNodes) {
      (node as Writable<AnyAbstractNode>).parent = root;
      linkAbstractNode(node);
    }
  }
}

// export function abstract<
//   T extends AnyAbstractNode,
// >(
//   type: T['type'],
//   id: string,
//   data: T['data'],
//   abstractNodes: T['abstractNodes'],
//   parent?: AnyAbstractNode,
//   render?: (data: T['data']) => void,
//   renderAbstractNodes?: (children: T['abstractNodes']) => void,
//   onViewHook?: (this: AbstractNode<T['type'], T>, abstractEvent: AbstractEvent, originEvent?: Event) => void,
// ): T {
//   return {
//     type,
//     id,
//     data,
//     abstractNodes,
//     parent,
//     render,
//     renderAbstractNodes,
//     onViewHook,
//   } as T;
// }

type NextData<T extends AbstractNode<DocType>> = T['data'] | ((prevData: T['data']) => T['data']) | undefined;

export function abstractUpdate<T extends AbstractNode<DocType>>(writableNode: Writable<T>, nextData: NextData<T>) {
  // @ts-ignore
  const finalNextData = typeof nextData === 'function' ? nextData(writableNode.data) as T['data'] : nextData;
  if (!isPartialShallowEqual(finalNextData, writableNode.data, true)) {
    writableNode.data = finalNextData;
    if (writableNode.render) {
      writableNode.render(finalNextData);
    }
  }
}

export function abstractSplice(node: Writable<AnyAbstractNode>, start: number, deleteCount: number, items: Writable<AnyAbstractNode>[], updateParent = false) {
  if (!deleteCount && !items.length) {
    return [];
  }
  const { abstractNodes = [], renderAbstractNodes } = node;
  assert(abstractNodes);

  if (
    deleteCount === items.length &&
    items.every((item, index) => item === abstractNodes[start + index])
  ) {
    return [];
  }

  const nextAbstractNodes = abstractNodes.slice() as typeof abstractNodes;
  const deleted = nextAbstractNodes.splice(start, deleteCount, ...items);
  if (updateParent) {
    for (const item of items) {
      item.parent = node;
    }
  }
  // @ts-ignore
  node.abstractNodes = nextAbstractNodes.length ? nextAbstractNodes : undefined;

  if (renderAbstractNodes) {
    renderAbstractNodes(node.abstractNodes);
  }
  return deleted;
}

// export type AbstractData<T extends IDocNode> = Omit<T, 'type' | 'id' | 'childNodes'>;

// export class AbstractNode<T extends IDocNode = any> {
//   readonly type: DocType;
//   readonly id: string;

//   // render view
//   data: AbstractData<T>;
//   render?(data: AbstractData<T>): void;
//   // render children
//   abstractNodes?: AbstractNode[];
//   renderAbstractNodes?(abstractNodes?: AbstractNode[]): void;

//   // intent hook
//   onViewIntent?(abstractIntent: AbstractIntent, originEvent?: Event): void | BubbleCallback;

//   constructor(
//     { type, id, childNodes, ...rest }: IDocNode,
//     public parent: AbstractNode | null,
//   ) {
//     this.type = type;
//     this.id = id;
//     this.data = rest as any;
//     this.abstractNodes = childNodes?.map(node => new AbstractNode(node, this));
//   }

//   update(partialData: Partial<AbstractData<T>>) {
//     if (isPartialShallowEqual(partialData, this.data)) {
//       return;
//     }
//     this.data = Object.assign({}, this.data, partialData);
//     if (this.render) {
//       this.render(this.data);
//     }
//   }

//   concat(...items: AbstractNode[]): AbstractNode[] {
//     if (items.length) {
//       this.abstractNodes = this.abstractNodes ? this.abstractNodes.concat(...items) : items;
//       if (this.renderAbstractNodes) {
//         this.renderAbstractNodes(this.abstractNodes);
//       }
//     }
//     return this.abstractNodes || [];
//   }

//   indexOf(searchElement: AbstractNode): number {
//     return this.abstractNodes ? this.abstractNodes.indexOf(searchElement) : -1;
//   }

//   splice(start: number, deleteCount?: number): AbstractNode[];
//   splice(start: number, deleteCount: number, ...items: AbstractNode[]): AbstractNode[];
//   splice(start: number, deleteCount?: number, ...items: AbstractNode[]): AbstractNode[] {
//     assert(this.abstractNodes);
//     let ret: AbstractNode[];
//     this.abstractNodes = this.abstractNodes.slice();
//     if (deleteCount == null) {
//       ret = this.abstractNodes.splice(start);
//     } else {
//       ret = this.abstractNodes.splice(start, deleteCount, ...items);
//     }

//     if (this.renderAbstractNodes) {
//       this.renderAbstractNodes(this.abstractNodes);
//     }
//     return ret;
//   }

//   /**
//    * [   a   b   c   d   e   ]
//    * 
//    * ### example 1
//    * replace: [a] -> [X]
//    * replace([X], a, a)
//    * 
//    * ### example 2
//    * replace: [b, c, d] -> [X1, X2]
//    * replace([X1, X2], b, d)
//    * 
//    * ### example 2
//    * replace: [b, c, d, e] -> [X1, X2]
//    * replace([X1, X2], b, e)
//    */
//   replace(candidates: AbstractNode[], from: AbstractNode, to: AbstractNode): AbstractNode[] {
//     assert(this.abstractNodes);
//     let fromIndex = this.abstractNodes.indexOf(from);
//     let toIndex = from === to ? fromIndex : this.abstractNodes.indexOf(to);

//     if (toIndex < fromIndex) {
//       [fromIndex, toIndex] = [toIndex, fromIndex];
//     }
//     assert(fromIndex !== -1 && toIndex !== -1);

//     const copy = this.abstractNodes.slice();
//     const ret = copy.splice(fromIndex, toIndex - fromIndex + 1, ...candidates);

//     this.abstractNodes = copy.length ? copy : undefined;
//     if (this.renderAbstractNodes) {
//       this.renderAbstractNodes(this.abstractNodes);
//     }
//     return ret;
//   }

//   detach() {
//     assert(this.parent);
//     this.parent.replace([], this, this);
//   }
// }

export function traverseAbstractNodesRecursively<T extends AbstractBaseEvent>(
  captureCallback: CaptureCallback<T, AnyAbstractNode>,
  event: T,
  node: AnyAbstractNode,
  forward: boolean,
  depth: number,
  boundary1?: AnyAbstractNode[],
  boundary2?: AnyAbstractNode[],
) {
  event.depth = depth;
  const currentIndex = event.index;
  const { abstractNodes } = node;

  const { leftEdge, rightEdge } = event;

  let start: number | undefined;
  let end: number | undefined;
  const nextDepth = depth + 1;

  if (event.propagating && !event.bailed && abstractNodes) {
    const node1 = boundary1 && nextDepth < boundary1.length && boundary1[nextDepth];
    const node2 = boundary2 && nextDepth < boundary2.length && boundary2[nextDepth];

    start = node1
      ? abstractNodes.indexOf(node1)
      : forward ? 0 : abstractNodes.length - 1;
    assert(start !== -1);

    end = node2
      ? (forward ? abstractNodes.indexOf(node2, start) : abstractNodes.lastIndexOf(node2, start))
      : (forward ? abstractNodes.length - 1 : 0);
    assert(end !== -1);

    assert(forward ? start <= end : end <= start);
  }

  event.leftEdge = leftEdge;
  event.rightEdge = rightEdge;
  const leftIndex = forward ? start : end;
  const rightIndex = forward ? end : start;
  event.leftChildIndex = leftIndex;
  event.rightChildIndex = rightIndex;
  const bubbleCallback = captureCallback.call(node, event);

  if (start !== undefined && end !== undefined) {
    assert(abstractNodes);
    const leftEdgeIndex = event.leftEdge && (forward ? start : end);
    const rightEdgeIndex = event.rightEdge && (forward ? end : start);

    for (
      let i = start;
      !event.bailed && (forward ? i <= end : i >= end);
      i = forward ? i + 1 : i - 1
    ) {
      assert(abstractNodes[i].parent);
      event.index = i;
      if (i === leftEdgeIndex) {
        event.leftEdge = true;
      } else if (event.leftEdge) {
        event.leftEdge = false;
      }
      if (i === rightEdgeIndex) {
        event.leftEdge = true;
      } else if (event.rightEdge) {
        event.rightEdge = false;
      }

      traverseAbstractNodesRecursively(
        captureCallback,
        event,
        abstractNodes[i],
        forward,
        nextDepth,
        i === start ? boundary1 : undefined,
        i === end ? boundary2 : undefined,
      );
    }
  }

  event.leftChildIndex = leftIndex;
  event.rightChildIndex = rightIndex;
  event.depth = depth;
  event.index = currentIndex;
  if (bubbleCallback) {
    bubbleCallback.call(node);
  }
  event.propagating = true;
}

export function traverseAbstractNodes<T extends AbstractBaseEvent = AbstractBaseEvent>(
  captureCallback: CaptureCallback<T, AnyAbstractNode>,
  origin: AnyAbstractNode,
  event: T,
  arg1?: AnyAbstractNode[] | AnyAbstractNode,
  arg2?: AnyAbstractNode[] | AnyAbstractNode,
) {
  const boundary1 = Array.isArray(arg1) ? arg1 : arg1 && getAbstractNodePath(arg1, origin);
  const boundary2 = arg1 === arg2 ? boundary1 : (
    Array.isArray(arg2) ? arg2 : arg2 && getAbstractNodePath(arg2, origin)
  );
  assert(!boundary1 || boundary1[0] === origin);
  assert(!boundary2 || boundary2[0] === origin);

  let finalBoundary1 = boundary1;
  let finalBoundary2 = boundary2;
  if (boundary1 && boundary2) {
    const position = compareAbstractPosition(
      boundary1[boundary1.length - 1],
      boundary2[boundary2.length - 1],
    );
    if (
      (position === AbstractPosition.Following && !event.forward) ||
      (position === AbstractPosition.Preceding && event.forward)
    ) {
      [finalBoundary2, finalBoundary1] = [finalBoundary1, finalBoundary2];
    }
  }
  event.boundary1 = finalBoundary1;
  event.boundary2 = finalBoundary2;

  traverseAbstractNodesRecursively(
    captureCallback,
    event,
    origin,
    event.forward,
    0,
    finalBoundary1,
    finalBoundary2,
  );
}
