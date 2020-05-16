import React, { useMemo } from 'react';
import { AbstractNode } from "../AbstractNode";
import { AbstractEventType, SelectionSynchronizePayload, SelectionRenderingPayload, DocType, AbstractDoc } from "../types";
import { useNextDocViews, useConnectAbstractNode, useOnViewHook } from "./hooks";
import { AbstractEvent, AbstractIntentTrace } from '../AbstractEvent';
import { AbstractRange, AbstractPoint } from '../AbstractSelection';

function docSyncSelection(event: AbstractEvent<SelectionSynchronizePayload, AbstractRange>) {
  return function bubbleDocSyncSelection() {
    const selection = event.trace.selection;
    if (selection && selection.anchorPoint && selection.focusPoint) {
      event.returnValue = new AbstractRange(
        selection.anchorPoint,
        selection.focusPoint,
        AbstractPoint.equals(selection.anchorPoint, selection.focusPoint),
        event.forward,
      );
    }
  };
}

function docRenderSelection(event: AbstractEvent<SelectionRenderingPayload, AbstractIntentTrace['windowSelection']>) {
  return function bubbleDocRenderSelection() {
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

function createViewHook() {
  return function onViewHook(this: AbstractDoc, event: AbstractEvent) {
    switch (event.type) {
      case AbstractEventType.SelectionSynchronize:
        return docSyncSelection(event);
      case AbstractEventType.SelectionRendering:
        return docRenderSelection(event);
    }
  }
}

function useDocOnViewHook(node: AbstractDoc, ref: React.RefObject<HTMLSpanElement>) {
  const onIntent = useMemo(() => createViewHook(), []);
  return useOnViewHook(node, onIntent);
}

export function DocView({ context }: { context: AbstractDoc }) {
  const ref = useConnectAbstractNode<HTMLDivElement>(context);
  useDocOnViewHook(context, ref);
  return <div ref={ref}>{useNextDocViews(context)}</div>;
}
