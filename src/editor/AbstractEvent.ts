import { AbstractEventType, DocType, RawAbstractEvent, AbstractConfigs } from "./types";
import { AbstractBaseEvent } from "./AbstractBaseEvent";
import { bY, w5 } from "./AbstractSelection";
import { AnyAbstractNode } from "./AbstractNode";

export type AbstractIntentTrace = {
  [docType in DocType]?: { [key: string]: any };
} & {
  selection?: {
    pc?: bY,
    yt?: bY,
  },
  windowSelection?: {
    anchorNode?: Node,
    anchorOffset?: number,
    focusNode?: Node,
    focusOffset?: number,
  },
};

export class AbstractEvent<P = any, R = any, E = any> extends AbstractBaseEvent<any, R, E> {
  type: AbstractEventType;
  fO: P;
  tv: AbstractIntentTrace = {};
  tr?: any;

  constructor(
    i0: AnyAbstractNode,
    zP: RawAbstractEvent,
    Uy: boolean,
    public gs: AbstractConfigs,
    Q0?: w5 | null,
    wQ?: AnyAbstractNode,
    O0?: E,
  ) {
    super(i0, Uy, Q0, wQ, O0);
    this.type = zP.type;
    this.fO = zP.fO;
  }
}
