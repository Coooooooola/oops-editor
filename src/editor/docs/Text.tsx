import React, { useMemo, forwardRef, useEffect, useLayoutEffect } from 'react';
import { AbstractNode, abstractUpdate } from "../AbstractNode";
import { AbstractEventType, Reference, SelectionSynchronizePayload, DocType, AbstractText, SelectionMovePayload, SelectionTryMovePayload, AbstractHooks, AbstractBrowserHooks } from "../types";
import { useAbstractNodeData, useConnectAbstractNode, useViewData } from "./hooks";
import { AbstractEvent } from '../AbstractEvent';
import { AbstractPoint, AbstractRange } from '../AbstractSelection';
import { $ } from '../AbstractHelper';
import { assert } from '../utils';

function selectionSynchronize(
  this: AbstractText,
  event: AbstractEvent<SelectionSynchronizePayload, AbstractRange>,
  { ref }: { ref: Reference<HTMLSpanElement, null> },
) {
  const { payload } = event;
  if (payload.anchorAbstractNode === this || payload.focusAbstractNode === this) {
    const textNode = ref.current?.firstChild;
    if (textNode) {
      const trace = event.trace.selection || { anchorPoint: undefined, focusPoint: undefined };
      event.trace.selection = trace;
      if (payload.anchorNode === textNode) {
        trace.anchorPoint = new AbstractPoint(this, payload.anchorOffset);
      }
      if (payload.focusNode === textNode) {
        trace.focusPoint = new AbstractPoint(this, payload.focusOffset);
      }
    }
  }
}

function selectionRendering(
  this: AbstractText,
  event: AbstractEvent<undefined, Range>,
  { ref }: { ref: Reference<HTMLSpanElement, null> },
) {
  const { range } = event;
  assert(range);
  if (range.anchor.node === this || range.focus.node === this) {
    const textNode = ref.current?.firstChild;
    if (textNode) {
      const trace = event.trace.windowSelection || {
        anchorNode: undefined,
        anchorOffset: undefined,
        focusNode: undefined,
        focusOffset: undefined,
      };
      event.trace.windowSelection = trace;
      if (range.anchor.node === this) {
        trace.anchorNode = textNode;
        trace.anchorOffset = range.anchor.offset;
      }
      if (range.focus.node === this) {
        trace.focusNode = textNode;
        trace.focusOffset = range.focus.offset;
      }
    }
  }
}

export function TextView({ context }: { context: AbstractText }) {
  const { content, style } = useAbstractNodeData(context);
  const ref = useConnectAbstractNode<HTMLSpanElement>(context);

  const viewData = useMemo(() => ({ ref }), [ref]);
  useViewData(context, viewData);

  const textContent = useMemo(() => content.replace(/ /g, '\u00a0'), [content]);

  return (
    <span ref={ref} style={style}>
      {textContent}
    </span>
  );
}

function selectionMove(
  this: AbstractText,
  event: AbstractEvent<SelectionMovePayload, AbstractRange, React.KeyboardEvent>,
) {
  assert(event.range);
  const { anchor, focus, isForward, collapsed } = event.range;
  const { forward, shift, step } = event.payload;
  if (focus.node === this) {
    let finalFocus: AbstractPoint;
    if (!shift && !collapsed) {
      const point = forward === isForward ? focus : anchor;
      event.returnValue = new AbstractRange(point, point);
      return;
    }

    if (forward) {
      const remain = this.data.content.length - focus.offset - step;
      if (remain >= 0) {
        finalFocus = new AbstractPoint(this, focus.offset + step);
      } else {
        const result = $(event.root).dispatchEvent<AbstractPoint, SelectionTryMovePayload>({
          type: AbstractEventType.SelectionTryMove,
          payload: {
            step: -remain,
            forward: true,
          },
        }, {
          initiator: this,
          point1: this,
          forward: true,
          configs: event.configs,
        });
        finalFocus = result || new AbstractPoint(this, this.data.content.length);
      }
    } else {
      const remain = focus.offset - step;
      if (remain > 0) {
        finalFocus = new AbstractPoint(this, focus.offset - step);
      } else {
        const result = $(event.root).dispatchEvent<AbstractPoint, SelectionTryMovePayload>({
          type: AbstractEventType.SelectionTryMove,
          payload: {
            step: -remain,
            forward: false,
          },
        }, {
          initiator: this,
          point1: this,
          forward: false,
          configs: event.configs,
        });
        finalFocus = result || new AbstractPoint(this, 0);
      }
    }

    const finalAnchor = shift ? anchor : finalFocus;

    event.returnValue = new AbstractRange(finalAnchor, finalFocus);
  }
}

function selectionTryMove(
  this: AbstractText,
  event: AbstractEvent<SelectionTryMovePayload>,
) {
  const { payload: { forward, step }, initiator } = event;
  assert(initiator);
  if (this === initiator) {
    event.stopPropagation();
    return;
  }
  event.payload.step = Math.max(0, step - this.data.content.length);
  if (event.payload.step === 0) {
    event.returnValue = new AbstractPoint(this, forward ? step : this.data.content.length - step);
    event.bail();
  }
}

function contentReplace(
  this: AbstractText,
  event: AbstractEvent,
) {
  assert(event.range);
  const { anchor, focus, isForward } = event.range;
  const anchorBool = anchor.node === this;
  const focusBool = focus.node === this;

  if (!anchorBool && !focusBool) {
    abstractUpdate(this, { content: '' });
    return;
  }

  const { content } = this.data;

  let spliceStart: number;
  let spliceEnd: number;
  if (isForward) {
    spliceStart = anchorBool ? anchor.offset : 0;
    spliceEnd = focusBool ? focus.offset : content.length;
  } else {
    spliceStart = anchorBool && !focusBool ? 0 : focus.offset;
    spliceEnd = focusBool && !anchorBool ? content.length : anchor.offset;
  }

  assert(spliceStart <= spliceEnd);
  const willFocus = isForward ? anchorBool : focusBool;
  const value = willFocus ? event.payload.key : '';
  const array = Array.from(content);
  array.splice(spliceStart, spliceEnd - spliceStart, value);
  abstractUpdate(this, { content: array.join('') });
  if (willFocus) {
    const point = new AbstractPoint(this, spliceStart + value.length);
    event.returnValue = new AbstractRange(point, point);
  }
}

function textEnter(
  this: AbstractText,
  event: AbstractEvent,
) {
  console.log('enter')
}

const hooks: AbstractHooks = {
  [AbstractEventType.SelectionMove]: selectionMove,
  [AbstractEventType.SelectionTryMove]: selectionTryMove,
  [AbstractEventType.ContentReplace]: contentReplace,
  [AbstractEventType.TextEnter]: textEnter,
};

const browserHooks: AbstractBrowserHooks = {
  [AbstractEventType.SelectionSynchronize]: selectionSynchronize,
  [AbstractEventType.SelectionRendering]: selectionRendering,
};

export const TextConfig = {
  View: TextView,
  hooks,
  browserHooks,
};
