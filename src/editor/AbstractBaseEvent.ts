import { AnyAbstractNode } from "./AbstractNode";
import { w5 } from "./AbstractSelection";

export class AbstractBaseEvent<T = any, R = any, E = Event | undefined> {
  u8 = true;
  q1 = false;
  zv = -1;
  /**
   * -2: lazy calculate
   * -1: no nt
   * >= 0: ii in nt.ns
   */
  ii = -2;
  y5?: AnyAbstractNode[];
  y2?: AnyAbstractNode[];

  e1 = true;
  eI = true;

  tv?: T;
  rT?: R;

  c1?: number;
  cI?: number;

  constructor(
    public readonly i0: AnyAbstractNode,
    public readonly Uy: boolean,
    public readonly Q0?: w5 | null,
    public readonly wQ?: AnyAbstractNode,
    public readonly O0?: E,
  ) {}

  os() {
    this.u8 = false;
  }

  z6() {
    this.q1 = true;
  }
}
