import React, { useMemo } from 'react';
import { AbstractNode } from "../AbstractNode";
import { IDoc, IntentType, SelectionSynchronizePayload, SelectionRenderingPayload } from "../types";
import { useNextDocViews, useConnectAbstractNode, useOnIntent } from "./hooks";
import { AbstractIntent, AbstractIntentTrace } from '../AbstractIntent';
import { AbstractRange, AbstractPoint } from '../AbstractSelection';

function useDocOnIntent(node: AbstractNode, ref: React.RefObject<HTMLSpanElement>) {
  const onIntent = useMemo(() => {
    function docSyncSelection(intent: AbstractIntent<SelectionSynchronizePayload, AbstractRange>) {
      return function bubbleDocSyncSelection() {
        const selection = intent.trace.selection;
        if (selection && selection.anchorPoint && selection.focusPoint) {
          intent.returnValue = new AbstractRange(
            selection.anchorPoint,
            selection.focusPoint,
            AbstractPoint.equals(selection.anchorPoint, selection.focusPoint),
            intent.forward,
          );
        }
      };
    }

    function docRenderSelection(intent: AbstractIntent<SelectionRenderingPayload, AbstractIntentTrace['windowSelection']>) {
      return function bubbleDocRenderSelection() {
        const windowSelection = intent.trace.windowSelection;
        if (
          windowSelection &&
          windowSelection.anchorNode &&
          windowSelection.anchorOffset != null &&
          windowSelection.focusNode &&
          windowSelection.focusOffset != null
        ) {
          intent.returnValue = windowSelection;
        }
      };
    }

    return function docOnIntent(intent: AbstractIntent, originEvent: Event) {
      switch (intent.type) {
        case IntentType.SelectionSynchronize:
          return docSyncSelection(intent);
        case IntentType.SelectionRendering:
          return docRenderSelection(intent);
      }
    };
  }, []);

  return useOnIntent(node, onIntent);
}

export function DocView({ context }: { context: AbstractNode<IDoc> }) {
  const ref = useConnectAbstractNode<HTMLDivElement>(context);
  useDocOnIntent(context, ref);
  return <div ref={ref}>{useNextDocViews(context)}</div>;
}
