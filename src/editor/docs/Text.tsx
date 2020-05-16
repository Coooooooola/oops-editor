import React, { useMemo } from 'react';
import { AbstractNode } from "../AbstractNode";
import { AbstractEventType, Reference, SelectionSynchronizePayload, SelectionRenderingPayload, DocType, AbstractText } from "../types";
import { useAbstractNodeData, useConnectAbstractNode, useOnViewHook } from "./hooks";
import { AbstractEvent } from '../AbstractEvent';
import { AbstractPoint } from '../AbstractSelection';

function textSyncSelection(
  node: AbstractText,
  event: AbstractEvent<SelectionSynchronizePayload, AbstractRange>,
  ref: Reference<HTMLSpanElement, null>,
) {
  const { payload } = event;
  if (payload.anchorAbstractNode === node || payload.focusAbstractNode === node) {
    const textNode = ref.current?.firstChild;
    if (textNode) {
      const trace = event.trace.selection || { anchorPoint: undefined, focusPoint: undefined };
      event.trace.selection = trace;
      if (payload.anchorNode === textNode) {
        trace.anchorPoint = new AbstractPoint(node, payload.anchorOffset);
      }
      if (payload.focusNode === textNode) {
        trace.focusPoint = new AbstractPoint(node, payload.focusOffset);
      }
    }
  }
}

function textRenderSelection(
  node: AbstractText,
  event: AbstractEvent<SelectionRenderingPayload, Range>,
  ref: Reference<HTMLSpanElement, null>,
) {
  const { payload } = event;
  if (payload.range.anchor.node === node || payload.range.focus.node === node) {
    const textNode = ref.current?.firstChild;
    if (textNode) {
      const trace = event.trace.windowSelection || {
        anchorNode: undefined,
        anchorOffset: undefined,
        focusNode: undefined,
        focusOffset: undefined,
      };
      event.trace.windowSelection = trace;
      if (payload.range.anchor.node === node) {
        trace.anchorNode = textNode;
        trace.anchorOffset = payload.range.anchor.offset;
      }
      if (payload.range.focus.node === node) {
        trace.focusNode = textNode;
        trace.focusOffset = payload.range.focus.offset;
      }
    }
  }
}

function createViewHook(ref: Reference<HTMLSpanElement, null>) {
  return function onViewHook(this: AbstractText, event: AbstractEvent, originEvent?: Event) {
    switch (event.type) {
      case AbstractEventType.SelectionSynchronize:
        return textSyncSelection(this, event, ref);
      case AbstractEventType.SelectionRendering:
        return textRenderSelection(this, event, ref);
    }
  }
}

function useTextOnViewHook(node: AbstractText, ref: React.RefObject<HTMLSpanElement>) {
  const onViewHook = useMemo(() => createViewHook(ref), [ref]);
  useOnViewHook(node, onViewHook);
}

export function TextView({ context }: { context: AbstractText }) {
  const { content, style } = useAbstractNodeData(context);
  const ref = useConnectAbstractNode<HTMLSpanElement>(context);
  useTextOnViewHook(context, ref);
  return (
    <span ref={ref} style={style}>
      {content}
    </span>
  );
}



function textMoveSelection(
  node: AbstractText,
  event: AbstractEvent<SelectionRenderingPayload, Range, React.KeyboardEvent>,
) {
  console.log(event);
}

export function textOnHook(this: AbstractText, event: AbstractEvent) {
  switch (event.type) {
    case AbstractEventType.SelectionBackward:
    case AbstractEventType.SelectionForward:
      return textMoveSelection(this, event);
  }
}

export const TextConfig = {
  View: TextView,
  onHook: textOnHook,
};
