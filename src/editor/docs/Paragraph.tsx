import React, { useMemo } from 'react';
import { AbstractNode } from "../AbstractNode";
import { AbstractEventType, SelectionSynchronizePayload, DocType, AbstractParagraph } from "../types";
import { useNextDocViews, useAbstractNodeData, useConnectAbstractNode, useOnViewHook } from "./hooks";
import { AbstractEvent } from '../AbstractEvent';

function paragraphSyncSelection(
  node: AbstractParagraph,
  event: AbstractEvent<SelectionSynchronizePayload, AbstractRange>,
) {
  const { payload } = event;
  if (payload.anchorAbstractNode === node || payload.focusAbstractNode === node) {
    // TODO
  }
}

function createParagraphViewHook() {
  return function onViewHook(this: AbstractParagraph, event: AbstractEvent) {
    switch (event.type) {
      case AbstractEventType.SelectionSynchronize:
        return paragraphSyncSelection(this, event);
    }
  };
}

function useParapraphOnViewHook(node: AbstractParagraph, ref: React.RefObject<HTMLDivElement>) {
  const onViewHook = useMemo(() => createParagraphViewHook(), []);
  useOnViewHook(node, onViewHook);
}

export function ParagraphView({ context }: { context: AbstractParagraph }) {
  const ref = useConnectAbstractNode<HTMLDivElement>(context);
  const data = useAbstractNodeData(context);
  const views = useNextDocViews(context);
  useParapraphOnViewHook(context, ref);
  return (
    <div ref={ref} style={{ textAlign: data && data.align }}>
      {views}
    </div>
  );
}
