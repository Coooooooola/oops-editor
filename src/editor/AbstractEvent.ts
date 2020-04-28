import { AbstractNode } from "./AbstractNode";

export class AbstractEvent<T = any, R = any> {
  propagating = true;
  bailed = false;
  depth = -1;
  /**
   * -2: lazy calculate
   * -1: no parent
   * >= 0: index in parent.abstractNodes
   */
  index = -2;
  boundary1?: AbstractNode[];
  boundary2?: AbstractNode[];

  trace?: T;
  returnValue?: R;

  constructor(public readonly forward: boolean) {}

  stopPropagation() {
    this.propagating = false;
  }

  bail() {
    this.bailed = true;
  }
}
