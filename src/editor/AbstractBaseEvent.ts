import { AnyAbstractNode } from "./AbstractNode";

export class AbstractBaseEvent<T = any, R = any, U = Event | undefined> {
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

  trace?: T;
  returnValue?: R;

  constructor(public readonly forward: boolean, public readonly originEvent?: U) {}

  stopPropagation() {
    this.propagating = false;
  }

  bail() {
    this.bailed = true;
  }
}
