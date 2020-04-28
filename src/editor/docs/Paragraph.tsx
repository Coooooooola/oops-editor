import React, { useMemo } from 'react';
import { AbstractNode } from "../AbstractNode";
import { IDocParagraph, IntentType, SelectionSynchronizePayload } from "../types";
import { useNextDocViews, useAbstractNodeData, useConnectAbstractNode, useOnIntent } from "./hooks";
import { AbstractIntent } from '../AbstractIntent';

function useParapraphOnIntent(node: AbstractNode, ref: React.RefObject<HTMLDivElement>) {
  const onIntent = useMemo(() => {
    function paragraphSyncSelection(intent: AbstractIntent<SelectionSynchronizePayload, AbstractRange>) {
      const { payload } = intent;
      if (payload.anchorAbstractNode === node || payload.focusAbstractNode === node) {
        // TODO
      }
    }

    return function paragraphOnIntent(intent: AbstractIntent, originEvent: Event) {
      switch (intent.type) {
        case IntentType.SelectionSynchronize:
          return paragraphSyncSelection(intent);
      }
    }
  }, [node]);
  useOnIntent(node, onIntent);
}

export function ParagraphView({ context }: { context: AbstractNode<IDocParagraph> }) {
  const ref = useConnectAbstractNode<HTMLDivElement>(context);
  const { align } = useAbstractNodeData(context);
  const views = useNextDocViews(context);
  useParapraphOnIntent(context, ref);
  return (
    <div ref={ref} style={{ textAlign: align }}>
      {views}
    </div>
  );
}
