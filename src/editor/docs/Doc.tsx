import React, { useMemo } from 'react';
import { AbstractNode } from "../AbstractNode";
import { AbstractEventType, SelectionSynchronizePayload, DocType, AbstractDoc, AbstractBrowserHooks } from "../types";
import { useNextDocViews, useConnectAbstractNode, useViewState } from "./hooks";
import { AbstractEvent, AbstractIntentTrace } from '../AbstractEvent';
import { w5, bY } from '../AbstractSelection';

function selectionSynchronize(event: AbstractEvent<SelectionSynchronizePayload, w5>) {
  return function bubbleDocSyncSelection() {
    const selection = event.tv.selection;
    if (selection && selection.pc && selection.yt) {
      event.rT = new w5(
        selection.pc,
        selection.yt,
      );
    }
  };
}

function selectionRendering(event: AbstractEvent<any, AbstractIntentTrace['windowSelection']>) {
  return function bubbleSelectionRendering() {
    const windowSelection = event.tv.windowSelection;
    if (
      windowSelection &&
      windowSelection.anchorNode &&
      windowSelection.anchorOffset != null &&
      windowSelection.focusNode &&
      windowSelection.focusOffset != null
    ) {
      event.rT = windowSelection;
    }
  };
}

export function DocView({ tr }: { tr: AbstractDoc }) {
  const ref = useConnectAbstractNode<HTMLDivElement>(tr);
  return <div ref={ref}>{useNextDocViews(tr)}</div>;
}

const w007O: AbstractBrowserHooks = {
  [0]: selectionSynchronize,
  [1]: selectionRendering,
};

export const DocConfig = {
  View: DocView,
  hooks: {},
  w007O,
};
