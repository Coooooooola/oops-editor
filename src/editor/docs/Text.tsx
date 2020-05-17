import React, { useMemo, forwardRef } from 'react';
import { AbstractNode } from "../AbstractNode";
import { AbstractEventType, Reference, SelectionSynchronizePayload, DocType, AbstractText, SelectionMovePayload, SelectionTryMovePayload } from "../types";
import { useAbstractNodeData, useConnectAbstractNode, useViewHook } from "./hooks";
import { AbstractEvent } from '../AbstractEvent';
import { AbstractPoint, AbstractRange } from '../AbstractSelection';
import { $ } from '../AbstractHelper';
import { assert } from '../utils';

function selectionSynchronize(
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

function selectionRendering(
  node: AbstractText,
  event: AbstractEvent<undefined, Range>,
  ref: Reference<HTMLSpanElement, null>,
) {
  const { range } = event;
  assert(range);
  if (range.anchor.node === node || range.focus.node === node) {
    const textNode = ref.current?.firstChild;
    if (textNode) {
      const trace = event.trace.windowSelection || {
        anchorNode: undefined,
        anchorOffset: undefined,
        focusNode: undefined,
        focusOffset: undefined,
      };
      event.trace.windowSelection = trace;
      if (range.anchor.node === node) {
        trace.anchorNode = textNode;
        trace.anchorOffset = range.anchor.offset;
      }
      if (range.focus.node === node) {
        trace.focusNode = textNode;
        trace.focusOffset = range.focus.offset;
      }
    }
  }
}

function createViewHook(ref: Reference<HTMLSpanElement, null>) {
  return function callViewHook(this: AbstractText, event: AbstractEvent) {
    switch (event.type) {
      case AbstractEventType.SelectionSynchronize:
        return selectionSynchronize(this, event, ref);
      case AbstractEventType.SelectionRendering:
        return selectionRendering(this, event, ref);
    }
  }
}

function useTextViewHook(node: AbstractText, ref: React.RefObject<HTMLSpanElement>) {
  const viewHook = useMemo(() => createViewHook(ref), [ref]);
  useViewHook(node, viewHook);
}

export function TextView({ context }: { context: AbstractText }) {
  const { content, style } = useAbstractNodeData(context);
  const ref = useConnectAbstractNode<HTMLSpanElement>(context);
  useTextViewHook(context, ref);
  return (
    <span ref={ref} style={{ ...style, whiteSpace: 'pre-wrap' }}>
      {content}
    </span>
  );
}



function selectionMove(
  node: AbstractText,
  event: AbstractEvent<SelectionMovePayload, AbstractRange, React.KeyboardEvent>,
) {
  assert(event.range);
  const { anchor, focus, isForward, collapsed } = event.range;
  const { forward, shift, step } = event.payload;
  if (focus.node === node) {
    let finalFocus: AbstractPoint;
    if (!shift && !collapsed) {
      const point = forward === isForward ? focus : anchor;
      event.returnValue = new AbstractRange(point, point);
      return;
    }

    if (forward) {
      const remain = node.data.content.length - focus.offset - step;
      if (remain >= 0) {
        finalFocus = new AbstractPoint(node, focus.offset + step);
      } else {
        const result = $(event.root).dispatchEvent<AbstractPoint, SelectionTryMovePayload>({
          type: AbstractEventType.SelectionTryMove,
          payload: {
            step: -remain,
            forward: true,
          },
        }, {
          initiator: node,
          point1: node,
          forward: true,
          configs: event.configs,
        });
        finalFocus = result || new AbstractPoint(node, node.data.content.length);
      }
    } else {
      const remain = focus.offset - step;
      if (remain > 0) {
        finalFocus = new AbstractPoint(node, focus.offset - step);
      } else {
        const result = $(event.root).dispatchEvent<AbstractPoint, SelectionTryMovePayload>({
          type: AbstractEventType.SelectionTryMove,
          payload: {
            step: -remain,
            forward: false,
          },
        }, {
          initiator: node,
          point1: node,
          forward: false,
          configs: event.configs,
        });
        finalFocus = result || new AbstractPoint(node, 0);
      }
    }

    const finalAnchor = shift ? anchor : finalFocus;

    event.returnValue = new AbstractRange(finalAnchor, finalFocus);
  }
}

function selectionTryMove(
  node: AbstractText,
  event: AbstractEvent<SelectionTryMovePayload>,
) {
  const { payload: { forward, step }, initiator } = event;
  assert(initiator);
  if (node === initiator) {
    event.stopPropagation();
    return;
  }
  event.payload.step = Math.max(0, step - node.data.content.length);
  if (event.payload.step === 0) {
    event.returnValue = new AbstractPoint(node, forward ? step : node.data.content.length - step);
    event.bail();
  }
}

function textInsert(
  node: AbstractText,
  event: AbstractEvent,
) {
  console.log(event)
}

function textEnter(
  node: AbstractText,
  event: AbstractEvent,
) {
  console.log('enter')
}

export function callHook(this: AbstractText, event: AbstractEvent) {
  switch (event.type) {
    case AbstractEventType.SelectionMove:
      return selectionMove(this, event);
    case AbstractEventType.SelectionTryMove:
      return selectionTryMove(this, event);
    case AbstractEventType.TextInsert:
      return textInsert(this, event);
    case AbstractEventType.TextEnter:
      return textEnter(this, event);
  }
}

export const TextConfig = {
  View: TextView,
  callHook,
};
