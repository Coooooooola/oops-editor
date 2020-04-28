import { IntentType, DocType, Intent } from "./types";
import { AbstractEvent } from "./AbstractEvent";
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

export class AbstractIntent<T = any, R = any> extends AbstractEvent<any, R> {
  type: IntentType;
  payload: T;
  trace: AbstractIntentTrace = {};

  constructor(intent: Intent, forward: boolean) {
    super(forward);
    this.type = intent.type;
    this.payload = intent.payload;
  }

  writeValue(subValue: Partial<AbstractIntentTrace>) {
    this.trace = Object.assign({}, this.trace, subValue);
  }
}
