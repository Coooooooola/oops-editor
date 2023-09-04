import React, { useMemo } from "react";
import { AbstractNode, abstractSplice } from "../AbstractNode";
import {
  AbstractEventType,
  SelectionSynchronizePayload,
  DocType,
  AbstractParagraph,
  AbstractBrowserHooks,
  EditorConfigs,
} from "../types";
import {
  useNextDocViews,
  useAbstractNodeData,
  useConnectAbstractNode,
  useViewState,
} from "./hooks";
import { AbstractEvent } from "../AbstractEvent";
import { assert, randomId } from "../utils";
import { createAbstractText } from "./Text";
import { AbstractPoint, AbstractRange } from "../AbstractSelection";

function paragraphSyncSelection(
  this: AbstractParagraph,
  event: AbstractEvent<SelectionSynchronizePayload, AbstractRange>
) {
  const { payload } = event;
  if (
    payload.anchorAbstractNode === this ||
    payload.focusAbstractNode === this
  ) {
    const trace = event.trace.selection || {
      anchorPoint: undefined,
      focusPoint: undefined,
    };
    event.trace.selection = trace;

    const div = this.state.ref.current;
    assert(div);
    if (payload.anchorNode === div) {
      let node;
      let len;
      if (payload.anchorOffset === 0) {
        node = this.abstractNodes[0];
        len = 0;
      } else {
        node = this.abstractNodes[this.abstractNodes.length - 1];
        len = node.data.content.length;
      }
      trace.anchorPoint = new AbstractPoint(node, len);
    }
    if (payload.focusNode === div) {
      let node;
      let len;
      if (payload.focusOffset === 0) {
        node = this.abstractNodes[0];
        len = 0;
      } else {
        node = this.abstractNodes[this.abstractNodes.length - 1];
        len = node.data.content.length;
      }
      trace.focusPoint = new AbstractPoint(node, len);
    }
  }
}

export function ParagraphView({ context }: { context: AbstractParagraph }) {
  const data = useAbstractNodeData(context);
  const views = useNextDocViews(context);
  const ref = useConnectAbstractNode<HTMLDivElement>(context);
  const viewData = useMemo(() => ({ ref }), [ref]);
  useViewState(context, viewData);
  return (
    <div ref={ref} style={{ textAlign: data && data.align }}>
      {views}
    </div>
  );
}

const browserHooks: AbstractBrowserHooks = {
  [AbstractEventType.SelectionSynchronize]: paragraphSyncSelection,
};

function contentReplace(this: AbstractParagraph, event: AbstractEvent) {
  const { context, payload } = event;
  if (payload.prevParagraph) {
    abstractSplice(
      this,
      this.abstractNodes.length,
      0,
      payload.prevParagraph.abstractNodes,
      true
    );
  }
  return function bubble(this: AbstractParagraph) {
    assert(context);
    context.replace();
    if (payload.prevParagraph) {
      context.parentContext.pop();
    }
    if (this.abstractNodes) {
      context.parentContext.push(this);
      if (!payload.prevParagraph) {
        payload.prevParagraph = this;
      }
    }
  };
}

function textFormatStyle(this: AbstractParagraph, event: AbstractEvent) {
  const { context } = event;
  return function bubble(this: AbstractParagraph) {
    assert(context);
    context.replace();
    if (this.abstractNodes) {
      context.parentContext.push(this);
    }
  };
}

function paragraphEnter(this: AbstractParagraph, event: AbstractEvent) {
  return function bubble(this: AbstractParagraph) {
    assert(event.rightChildIndex != null);
    const deleted = abstractSplice(
      this,
      event.rightChildIndex + 1,
      this.abstractNodes.length - event.rightChildIndex - 1,
      []
    );
    if (event.payload.splitedText) {
      deleted.unshift(event.payload.splitedText);
    }
    const newParagraph = {
      type: DocType.Paragraph,
      id: randomId(),
      data: undefined,
      abstractNodes: undefined,
    };
    if (!deleted.length) {
      deleted.push(
        createAbstractText({
          data: { ...event.payload.prevText.data, content: "" },
        })
      );
    }
    abstractSplice(newParagraph, 0, 0, deleted, true);
    event.payload.splitedParagraph = newParagraph;
    event.returnValue = new AbstractRange(
      new AbstractPoint(deleted[0], 0),
      new AbstractPoint(deleted[0], 0)
    );
  };
}

function selectionTryMove(this: AbstractParagraph, event: AbstractEvent) {
  return function bubble() {
    event.payload.step--;
    if (event.payload.step < 0) {
      event.bail();
    }
  };
}

export const paragraphConfig: EditorConfigs[DocType.Paragraph] = {
  View: ParagraphView,
  hooks: {
    [AbstractEventType.ContentReplace]: contentReplace,
    [AbstractEventType.TextFormatStyle]: textFormatStyle,
    [AbstractEventType.TextEnter]: paragraphEnter,
    [AbstractEventType.SelectionTryMove]: selectionTryMove,
  },
  browserHooks,
};
