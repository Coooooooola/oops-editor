import React, { useMemo } from 'react';
import { AbstractNode } from "../AbstractNode";
import { AbstractEventType, SelectionSynchronizePayload, DocType, AbstractParagraph, AbstractBrowserHooks } from "../types";
import { useNextDocViews, useAbstractNodeData, useConnectAbstractNode, useViewData } from "./hooks";
import { AbstractEvent } from '../AbstractEvent';

function paragraphSyncSelection(
  this: AbstractParagraph,
  event: AbstractEvent<SelectionSynchronizePayload, AbstractRange>,
) {
  const { payload } = event;
  if (payload.anchorAbstractNode === this || payload.focusAbstractNode === this) {
    // TODO
  }
}

export function ParagraphView({ context }: { context: AbstractParagraph }) {
  const ref = useConnectAbstractNode<HTMLDivElement>(context);
  const data = useAbstractNodeData(context);
  const views = useNextDocViews(context);
  return (
    <div ref={ref} style={{ textAlign: data && data.align }}>
      {views}
    </div>
  );
}

const browserHooks: AbstractBrowserHooks = {
  [AbstractEventType.SelectionSynchronize]: paragraphSyncSelection,
};

export const paragraphConfig = {
  View: ParagraphView,
  hooks: {},
  browserHooks,
};
