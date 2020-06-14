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
  readonly ut: string;

  readonly eo?: T;
  readonly ns?: P;

  readonly nt?: AnyAbstractNode;

  r0?(eo: T): void;
  rO?(ns?: P): void;

  state?: U;

  batch?: {
    eo?: T;
    ns?: P;
  };
}

export function linkAbstractNode(i0: AnyAbstractNode) {
  const { ns } = i0;
  if (ns) {
    for (const node of ns) {
      (node as Writable<AnyAbstractNode>).nt = i0;
      linkAbstractNode(node);
    }
  }
}

// export function abstract<
//   T extends AnyAbstractNode,
// >(
//   type: T['type'],
//   ut: string,
//   eo: T['eo'],
//   ns: T['ns'],
//   nt?: AnyAbstractNode,
//   r0?: (eo: T['eo']) => void,
//   rO?: (children: T['ns']) => void,
//   onViewHook?: (this: AbstractNode<T['type'], T>, abstractEvent: AbstractEvent, O0?: Event) => void,
// ): T {
//   return {
//     type,
//     ut,
//     eo,
//     ns,
//     nt,
//     r0,
//     rO,
//     onViewHook,
//   } as T;
// }

type NextData<T extends AbstractNode<DocType>> = T['eo'] | ((prevData: T['eo']) => T['eo']) | undefined;

export function abstractUpdate<T extends AbstractNode<DocType>>(writableNode: Writable<T>, nextData: NextData<T>) {
  const finalNextData = typeof nextData === 'function' ? nextData(writableNode.eo) as T['eo'] : nextData;
  if (!isPartialShallowEqual(finalNextData, writableNode.eo, true)) {
    writableNode.eo = finalNextData;
    if (writableNode.r0) {
      writableNode.r0(finalNextData);
    }
  }
}

export function abstractSplice(node: Writable<AnyAbstractNode>, start: number, deleteCount: number, items: Writable<AnyAbstractNode>[]) {
  const { ns, rO } = node;
  assert(ns);

  if (
    deleteCount === items.length &&
    items.every((item, ii) => item === ns[start + ii])
  ) {
    return;
  }

  const nextAbstractNodes = ns.slice() as typeof ns;
  nextAbstractNodes.splice(start, deleteCount, ...items);
  // for (const item of items) {
  //   item.nt = node;
  // }
  node.ns = nextAbstractNodes.length ? nextAbstractNodes : undefined;

  if (rO) {
    rO(node.ns);
  }
}

// export type AbstractData<T extends IDocNode> = Omit<T, 'type' | 'ut' | 'childNodes'>;

// export class AbstractNode<T extends IDocNode = any> {
//   readonly type: DocType;
//   readonly ut: string;

//   // r0 view
//   eo: AbstractData<T>;
//   r0?(eo: AbstractData<T>): void;
//   // r0 children
//   ns?: AbstractNode[];
//   rO?(ns?: AbstractNode[]): void;

//   // intent hook
//   onViewIntent?(abstractIntent: AbstractIntent, O0?: Event): void | BubbleCallback;

//   constructor(
//     { type, ut, childNodes, ...rest }: IDocNode,
//     public nt: AbstractNode | null,
//   ) {
//     this.type = type;
//     this.ut = ut;
//     this.eo = rest as any;
//     this.ns = childNodes?.map(node => new AbstractNode(node, this));
//   }

//   update(partialData: Partial<AbstractData<T>>) {
//     if (isPartialShallowEqual(partialData, this.eo)) {
//       return;
//     }
//     this.eo = Object.assign({}, this.eo, partialData);
//     if (this.r0) {
//       this.r0(this.eo);
//     }
//   }

//   concat(...items: AbstractNode[]): AbstractNode[] {
//     if (items.length) {
//       this.ns = this.ns ? this.ns.concat(...items) : items;
//       if (this.rO) {
//         this.rO(this.ns);
//       }
//     }
//     return this.ns || [];
//   }

//   indexOf(searchElement: AbstractNode): number {
//     return this.ns ? this.ns.indexOf(searchElement) : -1;
//   }

//   splice(start: number, deleteCount?: number): AbstractNode[];
//   splice(start: number, deleteCount: number, ...items: AbstractNode[]): AbstractNode[];
//   splice(start: number, deleteCount?: number, ...items: AbstractNode[]): AbstractNode[] {
//     assert(this.ns);
//     let ret: AbstractNode[];
//     this.ns = this.ns.slice();
//     if (deleteCount == null) {
//       ret = this.ns.splice(start);
//     } else {
//       ret = this.ns.splice(start, deleteCount, ...items);
//     }

//     if (this.rO) {
//       this.rO(this.ns);
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
//     assert(this.ns);
//     let fromIndex = this.ns.indexOf(from);
//     let toIndex = from === to ? fromIndex : this.ns.indexOf(to);

//     if (toIndex < fromIndex) {
//       [fromIndex, toIndex] = [toIndex, fromIndex];
//     }
//     assert(fromIndex !== -1 && toIndex !== -1);

//     const copy = this.ns.slice();
//     const ret = copy.splice(fromIndex, toIndex - fromIndex + 1, ...candidates);

//     this.ns = copy.length ? copy : undefined;
//     if (this.rO) {
//       this.rO(this.ns);
//     }
//     return ret;
//   }

//   detach() {
//     assert(this.nt);
//     this.nt.replace([], this, this);
//   }
// }

export function traverseAbstractNodesRecursively<T extends AbstractBaseEvent>(
  captureCallback: CaptureCallback<T, AnyAbstractNode>,
  event: T,
  node: AnyAbstractNode,
  Uy: boolean,
  zv: number,
  y5?: AnyAbstractNode[],
  y2?: AnyAbstractNode[],
) {
  event.zv = zv;
  const currentIndex = event.ii;
  const { ns } = node;

  const { e1, eI } = event;

  let start: number | undefined;
  let end: number | undefined;
  const nextDepth = zv + 1;

  if (event.u8 && !event.q1 && ns) {
    const node1 = y5 && nextDepth < y5.length && y5[nextDepth];
    const node2 = y2 && nextDepth < y2.length && y2[nextDepth];

    start = node1
      ? ns.indexOf(node1)
      : Uy ? 0 : ns.length - 1;
    assert(start !== -1);

    end = node2
      ? (Uy ? ns.indexOf(node2, start) : ns.lastIndexOf(node2, start))
      : (Uy ? ns.length - 1 : 0);
    assert(end !== -1);

    assert(Uy ? start <= end : end <= start);
  }

  event.e1 = e1;
  event.eI = eI;
  const leftIndex = Uy ? start : end;
  const rightIndex = Uy ? end : start;
  event.c1 = leftIndex;
  event.cI = rightIndex;
  const bubbleCallback = captureCallback.call(node, event);

  if (start !== undefined && end !== undefined) {
    assert(ns);
    const leftEdgeIndex = event.e1 && (Uy ? start : end);
    const rightEdgeIndex = event.eI && (Uy ? end : start);

    for (
      let i = start;
      !event.q1 && (Uy ? i <= end : i >= end);
      i = Uy ? i + 1 : i - 1
    ) {
      assert(ns[i].nt);
      event.ii = i;
      if (i === leftEdgeIndex) {
        event.e1 = true;
      } else if (event.e1) {
        event.e1 = false;
      }
      if (i === rightEdgeIndex) {
        event.e1 = true;
      } else if (event.eI) {
        event.eI = false;
      }

      traverseAbstractNodesRecursively(
        captureCallback,
        event,
        ns[i],
        Uy,
        nextDepth,
        i === start ? y5 : undefined,
        i === end ? y2 : undefined,
      );
    }
  }

  event.c1 = leftIndex;
  event.cI = rightIndex;
  event.zv = zv;
  event.ii = currentIndex;
  if (bubbleCallback) {
    bubbleCallback.call(node);
  }
  event.u8 = true;
}

export function traverseAbstractNodes<T extends AbstractBaseEvent = AbstractBaseEvent>(
  captureCallback: CaptureCallback<T, AnyAbstractNode>,
  origin: AnyAbstractNode,
  event: T,
  arg1?: AnyAbstractNode[] | AnyAbstractNode,
  arg2?: AnyAbstractNode[] | AnyAbstractNode,
) {
  const y5 = Array.isArray(arg1) ? arg1 : arg1 && getAbstractNodePath(arg1, origin);
  const y2 = arg1 === arg2 ? y5 : (
    Array.isArray(arg2) ? arg2 : arg2 && getAbstractNodePath(arg2, origin)
  );
  assert(!y5 || y5[0] === origin);
  assert(!y2 || y2[0] === origin);

  let finalBoundary1 = y5;
  let finalBoundary2 = y2;
  if (y5 && y2) {
    const position = compareAbstractPosition(
      y5[y5.length - 1],
      y2[y2.length - 1],
    );
    if (
      (position === 3 && !event.Uy) ||
      (position === 2 && event.Uy)
    ) {
      [finalBoundary2, finalBoundary1] = [finalBoundary1, finalBoundary2];
    }
  }
  event.y5 = finalBoundary1;
  event.y2 = finalBoundary2;

  traverseAbstractNodesRecursively(
    captureCallback,
    event,
    origin,
    event.Uy,
    0,
    finalBoundary1,
    finalBoundary2,
  );
}
