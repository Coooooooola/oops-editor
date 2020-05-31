import React, { useMemo, forwardRef, useEffect, useLayoutEffect } from 'react';
import { AbstractNode, abstractUpdate, AnyAbstractNode } from "../AbstractNode";
import { AbstractEventType, Reference, SelectionSynchronizePayload, DocType, AbstractText, SelectionMovePayload, SelectionTryMovePayload, AbstractHooks, AbstractBrowserHooks, TextQueryStylePayload } from "../types";
import { useAbstractNodeData, useConnectAbstractNode, useViewState } from "./hooks";
import { AbstractEvent } from '../AbstractEvent';
import { AbstractPoint, AbstractRange } from '../AbstractSelection';
import { $ } from '../AbstractHelper';
import { assert, isPartialShallowEqual, randomId, pick } from '../utils';

export function createAbstractText({
  id = randomId(),
  data,
  parent,
}: {
  id?: string;
  data: AbstractText['data'];
  parent?: AnyAbstractNode;
}): AbstractText {
  return {
    type: DocType.Text,
    id,
    data,
    parent,
  };
}

export function isSameStyleText({ data: { style: style1 } }: AbstractText, { data: { style: style2 } }: AbstractText) {
  if (!style1 && !style2) {
    return true;
  }
  return (
    style1?.color === style2?.color &&
    style1?.fontFamily === style2?.fontFamily &&
    style1?.fontSize === style2?.fontSize &&
    style1?.fontStyle === style2?.fontStyle &&
    style1?.fontWeight === style2?.fontWeight &&
    style1?.textDecoration === style2?.textDecoration
  );
}

// function tryMergeText(leftText: AbstractText, rightText: AbstractText, forward: boolean): AbstractText | [AbstractText, AbstractText] {
//   const style1 = leftText.data.style;
//   const style2 = rightText.data.style;
//   if (isPartialShallowEqual(style1, style2, true)) { // incorrect shallow equal
//     return createAbstractText({
//       content: leftText.data.content + rightText.data.content,
//       style: style1,
//     });
//   }
//   return [leftText, rightText];
// }

function selectionSynchronize(
  this: AbstractText,
  event: AbstractEvent<SelectionSynchronizePayload, AbstractRange>,
) {
  const { ref } = this.state;
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
) {
  const { ref } = this.state;
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

function _TextView({ context }: { context: AbstractText }) {
  const { content, style } = useAbstractNodeData(context);
  const ref = useConnectAbstractNode<HTMLSpanElement>(context);

  const viewData = useMemo(() => ({ ref }), [ref]);
  useViewState(context, viewData);

  return (
    <span ref={ref} style={style}>
      {content.replace(/ /g, '\u00a0')}
    </span>
  );
}
_TextView.displayName = 'TextView';
const TextView = React.memo(_TextView, () => true);

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
      let point = forward === isForward ? focus : anchor;
      if (!forward && point.offset === 0) {
        const result = $(event.root).dispatchEvent<AbstractPoint, SelectionTryMovePayload>({
          type: AbstractEventType.SelectionTryMove,
          payload: {
            step: 0,
            forward: false,
          },
        }, {
          initiator: point.node,
          point1: point.node,
          forward: false,
          configs: event.configs,
        });
        if (result) {
          point = result;
        }
      }
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
      if (remain > 0 || (shift && remain === 0)) {
        finalFocus = new AbstractPoint(this, remain);
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

    let finalAnchor = shift ? anchor : finalFocus;
    if (shift) {
      if (forward ? anchor.offset === anchor.node.data.content.length : anchor.offset === 0) {
        const result = $(event.root).dispatchEvent<AbstractPoint, SelectionTryMovePayload>({
          type: AbstractEventType.SelectionTryMove,
          payload: {
            step: 0,
            forward,
          },
        }, {
          initiator: anchor.node,
          point1: anchor.node,
          forward,
          configs: event.configs,
        });
        if (result) {
          finalAnchor = result;
        }
      }
    }

    console.log(finalAnchor, finalFocus)
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

  if (anchorBool || focusBool) {
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
    const nextContent = array.join('');
    abstractUpdate(this, ({ style }) => ({
      content: nextContent,
      style,
    }));
    
    const context = event.context;
    if (context && nextContent) {
      context.parentContext.push(this);
      if (willFocus) {
        let point = new AbstractPoint(this, spliceStart + value.length);
        if (point.offset === 0) {
          const result = $(event.root).dispatchEvent<AbstractPoint, SelectionTryMovePayload>({
            type: AbstractEventType.SelectionTryMove,
            payload: {
              step: 0,
              forward: false,
            },
          }, {
            initiator: this,
            point1: this,
            forward: false,
            configs: event.configs,
          });
          if (result) {
            point = result;
          }
        }
        event.returnValue = new AbstractRange(point, point);
      }
    } else if (willFocus) {
      let result = $(event.root).dispatchEvent<AbstractPoint, SelectionTryMovePayload>({
        type: AbstractEventType.SelectionTryMove,
        payload: {
          step: 0,
          forward: false,
        },
      }, {
        initiator: this,
        point1: this,
        forward: false,
        configs: event.configs,
      });
      if (!result) {
        result = $(event.root).dispatchEvent<AbstractPoint, SelectionTryMovePayload>({
          type: AbstractEventType.SelectionTryMove,
          payload: {
            step: 0,
            forward: true,
          },
        }, {
          initiator: this,
          point1: this,
          forward: true,
          configs: event.configs,
        });
      }
      assert(result);
      event.returnValue = new AbstractRange(result, result);
    }
  }
}

function textEnter(
  this: AbstractText,
  event: AbstractEvent,
) {
  console.log('enter')
}

function textQueryStyle(
  this: AbstractText,
  event: AbstractEvent<TextQueryStylePayload, AbstractText['data']['style']>,
) {
  const { style } = this.data;
  const { payload } = event;

  if (!style) {
    event.returnValue = {};
    event.bail();
    return;
  }

  if (event.returnValue === undefined) {
    event.returnValue = pick(style, payload.keys, true);
    payload.keys = Object.keys(event.returnValue) as TextQueryStylePayload['keys'];
  }

  const { returnValue } = event;
  const { keys } = payload;
  let requireClean = false;
  for (const key of keys) {
    if (style[key] !== returnValue[key]) {
      returnValue[key] = undefined;
      if (!requireClean) {
        requireClean = true;
      }
    }
  }

  if (requireClean) {
    event.returnValue = pick(returnValue, keys, true);
    payload.keys = Object.keys(event.returnValue) as TextQueryStylePayload['keys'];
    if (!payload.keys.length) {
      event.bail();
    }
  }
}

function pushText({ parentContext }: any, data: AbstractText['data'], parent?: AnyAbstractNode, absText = createAbstractText({ data, parent })) {
  assert(parentContext);
  const lastNode: AnyAbstractNode | undefined = parentContext.peek();
  abstractUpdate(absText, data);
  if (
    !lastNode ||
    lastNode.type !== DocType.Text ||
    !isSameStyleText(lastNode as AbstractText, absText)
  ) {
    parentContext.push(absText);
    return absText;
  } else {
    abstractUpdate(lastNode as AbstractText, prev => ({
      content: prev.content + data.content,
      style: prev.style,
    }));
    return lastNode;
  }
}

function textFormatStyle(
  this: AbstractText,
  event: AbstractEvent,
) {
  const { data: { content, style } } = this;
  const { payload, context, range } = event;
  assert(context && range);
  const { anchor, focus, isForward } = range;

  let leftContent: string | undefined;
  let rightContent: string | undefined;
  let left: AbstractPoint | undefined;
  let right: AbstractPoint | undefined;
  if (!range.collapsed && (anchor.node === this || focus.node === this)) {
    const _anchor = anchor.node === this ? anchor : undefined;
    const _focus = focus.node === this ? focus : undefined;
    [left, right] = isForward ? [_anchor, _focus] : [_focus, _anchor];
    if (left && left.offset > 0) {
      leftContent = content.slice(0, left.offset);
    }
    if (right && right.offset < content.length) {
      rightContent = content.slice(right.offset);
    }
  }
  const formatContent = !leftContent && !rightContent ? content : content.slice(left?.offset, right?.offset);

  if (leftContent) {
    pushText(context, {
      content: leftContent,
      style,
    }, this.parent);
  }
  const formatedData = payload.excludes.indexOf(this) !== -1 ? this.data : {
    content: formatContent,
    style: {
      ...style,
      ...payload.style,
    },
  };
  const formatedText = pushText(context, formatedData, this.parent, this);
  const rightText = rightContent ? pushText(context, { content: rightContent, style }, this.parent) : undefined;

  if (left || right) {
    const abstractRange = event.returnValue;
    const leftPoint = (
      left &&
      new AbstractPoint(formatedText, formatedText.data.content.length - formatContent.length)
    );
    const rightPoint = (
      right &&
      new AbstractPoint(formatedText, formatedText.data.content.length - (rightText === formatedText ? rightContent!.length : 0))
    );
    let p1: AbstractPoint;
    let p2: AbstractPoint;
    if (isForward) {
      p1 = leftPoint || abstractRange?.anchor || rightPoint;
      p2 = rightPoint || abstractRange?.focus || leftPoint;
    } else {
      p1 = rightPoint || abstractRange?.anchor || leftPoint;
      p2 = leftPoint || abstractRange?.focus || rightPoint;
    }
    event.returnValue = new AbstractRange(p1, p2);
  }
}

const hooks: AbstractHooks = {
  [AbstractEventType.SelectionMove]: selectionMove,
  [AbstractEventType.SelectionTryMove]: selectionTryMove,
  [AbstractEventType.ContentReplace]: contentReplace,
  [AbstractEventType.TextEnter]: textEnter,
  [AbstractEventType.TextQueryStyle]: textQueryStyle,
  [AbstractEventType.TextFormatStyle]: textFormatStyle,
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
