import React, { useMemo } from 'react';
import { AbstractNode } from "../AbstractNode";
import { AbstractEventType, SelectionSynchronizePayload, DocType, AbstractDoc, AbstractBrowserHooks } from "../types";
import { useNextDocViews, useConnectAbstractNode, useViewData } from "./hooks";
import { AbstractEvent, AbstractIntentTrace } from '../AbstractEvent';
import { AbstractRange, AbstractPoint } from '../AbstractSelection';

function docSyncSelection(event: AbstractEvent<SelectionSynchronizePayload, AbstractRange>) {
  return function bubbleDocSyncSelection() {
    const selection = event.trace.selection;
    if (selection && selection.anchorPoint && selection.focusPoint) {
      event.returnValue = new AbstractRange(
        selection.anchorPoint,
        selection.focusPoint,
      );
    }
  };
}

function docRenderSelection(event: AbstractEvent<any, AbstractIntentTrace['windowSelection']>) {
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

export function DocView({ context }: { context: AbstractDoc }) {
  const ref = useConnectAbstractNode<HTMLDivElement>(context);
  return <div ref={ref}>{useNextDocViews(context)}</div>;
}

const browserHooks: AbstractBrowserHooks = {
  [AbstractEventType.SelectionSynchronize]: docSyncSelection,
  [AbstractEventType.SelectionRendering]: docRenderSelection,
};

export const DocConfig = {
  View: DocView,
  hooks: {},
  browserHooks,
};
