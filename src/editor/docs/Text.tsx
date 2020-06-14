import React, { useMemo, forwardRef, useEffect, useLayoutEffect } from 'react';
import { AbstractNode, abstractUpdate, AnyAbstractNode } from "../AbstractNode";
import { AbstractEventType, Reference, SelectionSynchronizePayload, DocType, AbstractText, SelectionMovePayload, SelectionTryMovePayload, AbstractHooks, AbstractBrowserHooks, TextQueryStylePayload } from "../types";
import { useAbstractNodeData, useConnectAbstractNode, useViewState } from "./hooks";
import { AbstractEvent } from '../AbstractEvent';
import { bY, w5 } from '../AbstractSelection';
import { $ } from '../AbstractHelper';
import { assert, isPartialShallowEqual, randomId, pick } from '../utils';

export function createAbstractText({
  ut = randomId(),
  eo,
  nt,
}: {
  ut?: string;
  eo: AbstractText['eo'];
  nt?: AnyAbstractNode;
}): AbstractText {
  return {
    type: 4,
    ut,
    eo,
    nt,
  };
}

export function isSameStyleText({ eo: { style: style1 } }: AbstractText, { eo: { style: style2 } }: AbstractText) {
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

// function tryMergeText(leftText: AbstractText, rightText: AbstractText, Uy: boolean): AbstractText | [AbstractText, AbstractText] {
//   const style1 = leftText.eo.style;
//   const style2 = rightText.eo.style;
//   if (isPartialShallowEqual(style1, style2, true)) { // incorrect shallow equal
//     return createAbstractText({
//       e868: leftText.eo.e868 + rightText.eo.e868,
//       style: style1,
//     });
//   }
//   return [leftText, rightText];
// }

function selectionSynchronize(
  this: AbstractText,
  event: AbstractEvent<SelectionSynchronizePayload, w5>,
) {
  const { ref } = this.state;
  const { fO } = event;
  if (fO.anchorAbstractNode === this || fO.focusAbstractNode === this) {
    const textNode = ref.current?.firstChild;
    if (textNode) {
      const tv = event.tv.selection || { pc: undefined, yt: undefined };
      event.tv.selection = tv;
      if (fO.anchorNode === textNode) {
        tv.pc = new bY(this, fO.anchorOffset);
      }
      if (fO.focusNode === textNode) {
        tv.yt = new bY(this, fO.focusOffset);
      }
    }
  }
}

function selectionRendering(
  this: AbstractText,
  event: AbstractEvent<undefined, Range>,
) {
  const { ref } = this.state;
  const { Q0 } = event;
  assert(Q0);
  if (Q0.anchor.node === this || Q0.focus.node === this) {
    const textNode = ref.current?.firstChild;
    if (textNode) {
      const tv = event.tv.windowSelection || {
        anchorNode: undefined,
        anchorOffset: undefined,
        focusNode: undefined,
        focusOffset: undefined,
      };
      event.tv.windowSelection = tv;
      if (Q0.anchor.node === this) {
        tv.anchorNode = textNode;
        tv.anchorOffset = Q0.anchor.offset;
      }
      if (Q0.focus.node === this) {
        tv.focusNode = textNode;
        tv.focusOffset = Q0.focus.offset;
      }
    }
  }
}

function _TextView({ tr }: { tr: AbstractText }) {
  const { e868, style } = useAbstractNodeData(tr);
  const ref = useConnectAbstractNode<HTMLSpanElement>(tr);

  const viewData = useMemo(() => ({ ref }), [ref]);
  useViewState(tr, viewData);

  return (
    <span ref={ref} style={style}>
      {e868.replace(/ /g, '\u00a0')}
    </span>
  );
}
// _TextView.displayName = 'TextView';
const TextView = React.memo(_TextView, () => true);

function selectionMove(
  this: AbstractText,
  event: AbstractEvent<SelectionMovePayload, w5, React.KeyboardEvent>,
) {
  assert(event.Q0);
  const { anchor, focus, j754: isForward, fmke: collapsed } = event.Q0;
  const { Uy, i976, gO0 } = event.fO;
  if (focus.node === this) {
    let finalFocus: bY;
    if (!i976 && !collapsed) {
      let point = Uy === isForward ? focus : anchor;
      if (!Uy && point.offset === 0) {
        const result = $(event.i0).bv<bY, SelectionTryMovePayload>({
          type: 3,
          fO: {
            gO0: 0,
            Uy: false,
          },
        }, {
          wQ: point.node,
          oe87: point.node,
          Uy: false,
          gs: event.gs,
        });
        if (result) {
          point = result;
        }
      }
      event.rT = new w5(point, point);
      return;
    }

    if (Uy) {
      const remain = this.eo.e868.length - focus.offset - gO0;
      if (remain >= 0) {
        finalFocus = new bY(this, focus.offset + gO0);
      } else {
        const result = $(event.i0).bv<bY, SelectionTryMovePayload>({
          type: 3,
          fO: {
            gO0: -remain,
            Uy: true,
          },
        }, {
          wQ: this,
          oe87: this,
          Uy: true,
          gs: event.gs,
        });
        finalFocus = result || new bY(this, this.eo.e868.length);
      }
    } else {
      const remain = focus.offset - gO0;
      if (remain > 0 || (i976 && remain === 0)) {
        finalFocus = new bY(this, remain);
      } else {
        const result = $(event.i0).bv<bY, SelectionTryMovePayload>({
          type: 3,
          fO: {
            gO0: -remain,
            Uy: false,
          },
        }, {
          wQ: this,
          oe87: this,
          Uy: false,
          gs: event.gs,
        });
        finalFocus = result || new bY(this, 0);
      }
    }

    let finalAnchor = i976 ? anchor : finalFocus;
    if (i976) {
      if (Uy ? anchor.offset === anchor.node.eo.e868.length : anchor.offset === 0) {
        const result = $(event.i0).bv<bY, SelectionTryMovePayload>({
          type: 3,
          fO: {
            gO0: 0,
            Uy,
          },
        }, {
          wQ: anchor.node,
          oe87: anchor.node,
          Uy,
          gs: event.gs,
        });
        if (result) {
          finalAnchor = result;
        }
      }
    }

    console.log(finalAnchor, finalFocus)
    event.rT = new w5(finalAnchor, finalFocus);
  }
}

function selectionTryMove(
  this: AbstractText,
  event: AbstractEvent<SelectionTryMovePayload>,
) {
  const { fO: { Uy, gO0 }, wQ } = event;
  assert(wQ);
  if (this === wQ) {
    event.os();
    return;
  }
  event.fO.gO0 = Math.max(0, gO0 - this.eo.e868.length);
  if (event.fO.gO0 === 0) {
    event.rT = new bY(this, Uy ? gO0 : this.eo.e868.length - gO0);
    event.z6();
  }
}

function contentReplace(
  this: AbstractText,
  event: AbstractEvent,
) {
  assert(event.Q0);
  const { anchor, focus, j754: isForward } = event.Q0;
  const anchorBool = anchor.node === this;
  const focusBool = focus.node === this;

  if (anchorBool || focusBool) {
    const { e868 } = this.eo;
  
    let spliceStart: number;
    let spliceEnd: number;
    if (isForward) {
      spliceStart = anchorBool ? anchor.offset : 0;
      spliceEnd = focusBool ? focus.offset : e868.length;
    } else {
      spliceStart = anchorBool && !focusBool ? 0 : focus.offset;
      spliceEnd = focusBool && !anchorBool ? e868.length : anchor.offset;
    }
  
    assert(spliceStart <= spliceEnd);
    const willFocus = isForward ? anchorBool : focusBool;
    const value = willFocus ? event.fO.key : '';
    const array = Array.from(e868);
    array.splice(spliceStart, spliceEnd - spliceStart, value);
    const nextContent = array.join('');
    abstractUpdate(this, ({ style }) => ({
      e868: nextContent,
      style,
    }));
    
    const tr = event.tr;
    if (tr && nextContent) {
      tr.q54.push(this);
      if (willFocus) {
        let point = new bY(this, spliceStart + value.length);
        if (point.offset === 0) {
          const result = $(event.i0).bv<bY, SelectionTryMovePayload>({
            type: 3,
            fO: {
              gO0: 0,
              Uy: false,
            },
          }, {
            wQ: this,
            oe87: this,
            Uy: false,
            gs: event.gs,
          });
          if (result) {
            point = result;
          }
        }
        event.rT = new w5(point, point);
      }
    } else if (willFocus) {
      let result = $(event.i0).bv<bY, SelectionTryMovePayload>({
        type: 3,
        fO: {
          gO0: 0,
          Uy: false,
        },
      }, {
        wQ: this,
        oe87: this,
        Uy: false,
        gs: event.gs,
      });
      if (!result) {
        result = $(event.i0).bv<bY, SelectionTryMovePayload>({
          type: 3,
          fO: {
            gO0: 0,
            Uy: true,
          },
        }, {
          wQ: this,
          oe87: this,
          Uy: true,
          gs: event.gs,
        });
      }
      assert(result);
      event.rT = new w5(result, result);
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
  event: AbstractEvent<TextQueryStylePayload, AbstractText['eo']['style']>,
) {
  const { style } = this.eo;
  const { fO } = event;

  if (!style) {
    event.rT = {};
    event.z6();
    return;
  }

  if (event.rT === undefined) {
    event.rT = pick(style, fO.keys, true);
    fO.keys = Object.keys(event.rT) as TextQueryStylePayload['keys'];
  }

  const { rT } = event;
  const { keys } = fO;
  let requireClean = false;
  for (const key of keys) {
    if (style[key] !== rT[key]) {
      rT[key] = undefined;
      if (!requireClean) {
        requireClean = true;
      }
    }
  }

  if (requireClean) {
    event.rT = pick(rT, keys, true);
    fO.keys = Object.keys(event.rT) as TextQueryStylePayload['keys'];
    if (!fO.keys.length) {
      event.z6();
    }
  }
}

function pushText({ q54 }: any, eo: AbstractText['eo'], nt?: AnyAbstractNode, absText = createAbstractText({ eo, nt })) {
  assert(q54);
  const lastNode: AnyAbstractNode | undefined = q54.p11();
  abstractUpdate(absText, eo);
  if (
    !lastNode ||
    lastNode.type !== 4 ||
    !isSameStyleText(lastNode as AbstractText, absText)
  ) {
    q54.push(absText);
    return absText;
  } else {
    abstractUpdate(lastNode as AbstractText, prev => ({
      e868: prev.e868 + eo.e868,
      style: prev.style,
    }));
    return lastNode;
  }
}

function textFormatStyle(
  this: AbstractText,
  event: AbstractEvent,
) {
  const { eo: { e868, style } } = this;
  const { fO, tr, Q0 } = event;
  assert(tr && Q0);
  const { anchor, focus, j754: isForward } = Q0;

  let leftContent: string | undefined;
  let rightContent: string | undefined;
  let left: bY | undefined;
  let right: bY | undefined;
  if (!Q0.fmke && (anchor.node === this || focus.node === this)) {
    const _anchor = anchor.node === this ? anchor : undefined;
    const _focus = focus.node === this ? focus : undefined;
    [left, right] = isForward ? [_anchor, _focus] : [_focus, _anchor];
    if (left && left.offset > 0) {
      leftContent = e868.slice(0, left.offset);
    }
    if (right && right.offset < e868.length) {
      rightContent = e868.slice(right.offset);
    }
  }
  const formatContent = !leftContent && !rightContent ? e868 : e868.slice(left?.offset, right?.offset);

  if (leftContent) {
    pushText(tr, {
      e868: leftContent,
      style,
    }, this.nt);
  }
  const formatedData = fO.excludes.indexOf(this) !== -1 ? this.eo : {
    e868: formatContent,
    style: {
      ...style,
      ...fO.style,
    },
  };
  const formatedText = pushText(tr, formatedData, this.nt, this);
  const rightText = rightContent ? pushText(tr, { e868: rightContent, style }, this.nt) : undefined;

  if (left || right) {
    const abstractRange = event.rT;
    const leftPoint = (
      left &&
      new bY(formatedText, formatedText.eo.e868.length - formatContent.length)
    );
    const rightPoint = (
      right &&
      new bY(formatedText, formatedText.eo.e868.length - (rightText === formatedText ? rightContent!.length : 0))
    );
    let p1: bY;
    let p2: bY;
    if (isForward) {
      p1 = leftPoint || abstractRange?.anchor || rightPoint;
      p2 = rightPoint || abstractRange?.focus || leftPoint;
    } else {
      p1 = rightPoint || abstractRange?.anchor || leftPoint;
      p2 = leftPoint || abstractRange?.focus || rightPoint;
    }
    event.rT = new w5(p1, p2);
  }
}

const hooks: AbstractHooks = {
  [2]: selectionMove,
  [3]: selectionTryMove,
  [8]: contentReplace,
  [9]: textEnter,
  [11]: textQueryStyle,
  [10]: textFormatStyle,
};

const w007O: AbstractBrowserHooks = {
  [0]: selectionSynchronize,
  [1]: selectionRendering,
};

export const TextConfig = {
  View: TextView,
  hooks,
  w007O,
};
