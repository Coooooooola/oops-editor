import { AbstractEventType, DocType, RawAbstractEvent } from "./types";
import { AbstractBaseEvent } from "./AbstractBaseEvent";
import { AbstractPoint } from "./AbstractSelection";

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

export class AbstractEvent<T = any, R = any, U = any> extends AbstractBaseEvent<any, R, U> {
  type: AbstractEventType;
  payload: T;
  trace: AbstractIntentTrace = {};

  constructor(rawEvent: RawAbstractEvent, forward: boolean, originEvent?: U) {
    super(forward, originEvent);
    this.type = rawEvent.type;
    this.payload = rawEvent.payload;
  }

  writeValue(subValue: Partial<AbstractIntentTrace>) {
    this.trace = Object.assign({}, this.trace, subValue);
  }
}
