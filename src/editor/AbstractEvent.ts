import { AbstractEventType, DocType, RawAbstractEvent, AbstractConfigs } from "./types";
import { AbstractBaseEvent } from "./AbstractBaseEvent";
import { AbstractPoint, AbstractRange } from "./AbstractSelection";
import { AnyAbstractNode } from "./AbstractNode";

export type AbstractIntentTrace = {
  [docType in DocType]?: object;
} & {
  selection?: {
    anchorPoint?: AbstractPoint,
    focusPoint?: AbstractPoint,
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
  payload: P;
  trace: AbstractIntentTrace = {};

  constructor(
    root: AnyAbstractNode,
    rawEvent: RawAbstractEvent,
    forward: boolean,
    public configs: AbstractConfigs,
    range?: AbstractRange | null,
    initiator?: AnyAbstractNode,
    originEvent?: E,
  ) {
    super(root, forward, range, initiator, originEvent);
    this.type = rawEvent.type;
    this.payload = rawEvent.payload;
  }

  writeValue(subValue: Partial<AbstractIntentTrace>) {
    this.trace = Object.assign({}, this.trace, subValue);
  }
}
