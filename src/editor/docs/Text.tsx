import React, { useMemo } from 'react';
import { AbstractNode } from "../AbstractNode";
import { IDocText, IntentType, SelectionSynchronizePayload, SelectionRenderingPayload } from "../types";
import { useAbstractNodeData, useConnectAbstractNode, useOnIntent } from "./hooks";
import { AbstractIntent } from '../AbstractIntent';
import { AbstractPoint } from '../AbstractSelection';

function useTextOnIntent(node: AbstractNode, ref: React.RefObject<HTMLSpanElement>) {
  const onIntent = useMemo(() => {
    function textSyncSelection(intent: AbstractIntent<SelectionSynchronizePayload, AbstractRange>) {
      const { payload } = intent;
      if (payload.anchorAbstractNode === node || payload.focusAbstractNode === node) {
        const textNode = ref.current?.firstChild;
        if (textNode) {
          const trace = intent.trace.selection || { anchorPoint: undefined, focusPoint: undefined };
          intent.trace.selection = trace;
          if (payload.anchorNode === textNode) {
            trace.anchorPoint = new AbstractPoint(node, payload.anchorOffset);
          }
          if (payload.focusNode === textNode) {
            trace.focusPoint = new AbstractPoint(node, payload.focusOffset);
          }
        }
      }
    }

    function textRenderSelection(intent: AbstractIntent<SelectionRenderingPayload, Range>) {
      const { payload } = intent;
      if (payload.range.anchor.node === node || payload.range.focus.node === node) {
        const textNode = ref.current?.firstChild;
        if (textNode) {
          const trace = intent.trace.windowSelection || {
            anchorNode: undefined,
            anchorOffset: undefined,
            focusNode: undefined,
            focusOffset: undefined,
          };
          intent.trace.windowSelection = trace;
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

    return function textOnIntent(intent: AbstractIntent, originEvent: Event) {
      switch (intent.type) {
        case IntentType.SelectionSynchronize:
          return textSyncSelection(intent);
        case IntentType.SelectionRendering:
          return textRenderSelection(intent);
      }
    };
  }, [node, ref]);

  useOnIntent(node, onIntent);
}

export function TextView({ context }: { context: AbstractNode<IDocText> }) {
  const { content, style } = useAbstractNodeData(context);
  const ref = useConnectAbstractNode<HTMLSpanElement>(context);
  useTextOnIntent(context, ref);
  return (
    <span ref={ref} style={style}>
      {content}
    </span>
  );
}

export function textOnIntent(node: AbstractNode, intent: AbstractIntent) {
  switch (intent.type) {
  }
}

export const TextConfig = {
  View: TextView,
  onIntent: textOnIntent,
};
