
import React, { useMemo } from 'react';
import { AbstractNode } from "../AbstractNode";
import { AbstractEventType, SelectionSynchronizePayload, DocType, AbstractParagraph, AbstractBrowserHooks, EditorConfigs } from "../types";
import { useNextDocViews, useAbstractNodeData, useConnectAbstractNode, useViewState } from "./hooks";
import { AbstractEvent } from '../AbstractEvent';
import { assert } from '../utils';

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

function contentReplace(
  this: AbstractParagraph,
  event: AbstractEvent,
) {
  const { context } = event;
  return function bubble(this: AbstractParagraph) {
    assert(context);
    context.replace();
    if (this.abstractNodes) {
      context.parentContext.push(this);
    }
  };
}

function textFormatStyle(
  this: AbstractParagraph,
  event: AbstractEvent,
) {
  const { context } = event;
  return function bubble(this: AbstractParagraph) {
    assert(context);
    context.replace();
    if (this.abstractNodes) {
      context.parentContext.push(this);
    }
  };
}

export const paragraphConfig: EditorConfigs[DocType.Paragraph] = {
  View: ParagraphView,
  hooks: {
    [AbstractEventType.ContentReplace]: contentReplace,
    [AbstractEventType.TextFormatStyle]: textFormatStyle,
  },
  browserHooks,
};
