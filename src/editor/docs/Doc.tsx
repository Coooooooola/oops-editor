import React, { useMemo } from "react";
import { AbstractNode, abstractSplice } from "../AbstractNode";
import {
  AbstractEventType,
  SelectionSynchronizePayload,
  DocType,
  AbstractDoc,
  AbstractBrowserHooks,
} from "../types";
import { useNextDocViews, useConnectAbstractNode, useViewState } from "./hooks";
import { AbstractEvent, AbstractIntentTrace } from "../AbstractEvent";
import { AbstractRange, AbstractPoint } from "../AbstractSelection";
import { assert } from '../utils';

function selectionSynchronize(
  event: AbstractEvent<SelectionSynchronizePayload, AbstractRange>
) {
  return function bubbleDocSyncSelection() {
    const selection = event.trace.selection;
    if (selection && selection.anchorPoint && selection.focusPoint) {
      event.returnValue = new AbstractRange(
        selection.anchorPoint,
        selection.focusPoint
      );
    }
  };
}

function selectionRendering(
  event: AbstractEvent<any, AbstractIntentTrace["windowSelection"]>
) {
  return function bubbleSelectionRendering() {
    const windowSelection = event.trace.windowSelection;
    if (
      windowSelection &&
      windowSelection.anchorNode &&
      windowSelection.anchorOffset != null &&
      windowSelection.focusNode &&
      windowSelection.focusOffset != null
    ) {
      event.returnValue = windowSelection;
    }
  };
}

function docEnter(this: AbstractDoc, event: AbstractEvent) {
  return function bubble(this: AbstractDoc) {
    assert(event.rightChildIndex != null);
    abstractSplice(
      this,
      event.rightChildIndex + 1,
      0,
      [event.payload.splitedParagraph],
      true
    );
  };
}

export function DocView({ context }: { context: AbstractDoc }) {
  const ref = useConnectAbstractNode<HTMLDivElement>(context);
  return <div ref={ref}>{useNextDocViews(context)}</div>;
}

const browserHooks: AbstractBrowserHooks = {
  [AbstractEventType.SelectionSynchronize]: selectionSynchronize,
  [AbstractEventType.SelectionRendering]: selectionRendering,
};

export const DocConfig = {
  View: DocView,
  hooks: {
    [AbstractEventType.TextEnter]: docEnter,
  },
  browserHooks,
};
