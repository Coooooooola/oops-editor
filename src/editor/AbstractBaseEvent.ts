import { AnyAbstractNode } from "./AbstractNode";
import { AbstractRange } from "./AbstractSelection";

export class AbstractBaseEvent<T = any, R = any, E = Event | undefined> {
  propagating = true;
  bailed = false;
  depth = -1;
  /**
   * -2: lazy calculate
   * -1: no parent
   * >= 0: index in parent.abstractNodes
   */
  index = -2;
  boundary1?: AnyAbstractNode[];
  boundary2?: AnyAbstractNode[];

  leftEdge = true;
  rightEdge = true;

  trace?: T;
  returnValue?: R;

  leftChildIndex?: number;
  rightChildIndex?: number;

  constructor(
    public readonly root: AnyAbstractNode,
    public readonly forward: boolean,
    public readonly range?: AbstractRange | null,
    public readonly initiator?: AnyAbstractNode,
    public readonly originEvent?: E,
  ) {}

  stopPropagation() {
    this.propagating = false;
  }

  bail() {
    this.bailed = true;
  }
}
