
import React, { useMemo } from 'react';
import { AbstractNode } from "../AbstractNode";
import { AbstractEventType, SelectionSynchronizePayload, DocType, AbstractParagraph, AbstractBrowserHooks, EditorConfigs } from "../types";
import { useNextDocViews, useAbstractNodeData, useConnectAbstractNode, useViewState } from "./hooks";
import { AbstractEvent } from '../AbstractEvent';
import { assert } from '../utils';
import { w5 } from '../AbstractSelection';

function paragraphSyncSelection(
  this: AbstractParagraph,
  event: AbstractEvent<SelectionSynchronizePayload, w5>,
) {
  const { fO } = event;
  if (fO.anchorAbstractNode === this || fO.focusAbstractNode === this) {
    // TODO
  }
}

export function ParagraphView({ tr }: { tr: AbstractParagraph }) {
  const ref = useConnectAbstractNode<HTMLDivElement>(tr);
  const eo = useAbstractNodeData(tr);
  const views = useNextDocViews(tr);
  return (
    <div ref={ref} style={{ textAlign: eo && eo.align }}>
      {views}
    </div>
  );
}

const w007O: AbstractBrowserHooks = {
  [0]: paragraphSyncSelection,
};

function contentReplace(
  this: AbstractParagraph,
  event: AbstractEvent,
) {
  const { tr } = event;
  return function bubble(this: AbstractParagraph) {
    assert(tr);
    tr.replace();
    if (this.ns) {
      tr.q54.push(this);
    }
  };
}

function textFormatStyle(
  this: AbstractParagraph,
  event: AbstractEvent,
) {
  const { tr } = event;
  return function bubble(this: AbstractParagraph) {
    assert(tr);
    tr.replace();
    if (this.ns) {
      tr.q54.push(this);
    }
  };
}

export const paragraphConfig: EditorConfigs[3] = {
  View: ParagraphView,
  hooks: {
    [8]: contentReplace,
    [10]: textFormatStyle,
  },
  w007O,
};
