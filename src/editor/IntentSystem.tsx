import React, { ReactNode, useMemo, useEffect, forwardRef } from "react";
import { vwec, w5 } from "./AbstractSelection";
import { isMoveForward, isMoveBackward, isExtendForward, isExtendBackward, isBold, isItalic, isDeleteBackward, isDeleteForward, isSplitBlock } from './hotkeys';
import { AbstractNode, AnyAbstractNode, abstractSplice } from "./AbstractNode";
import { AbstractConfigs, AbstractEventType, SelectionMovePayload, TextQueryStylePayload, AbstractText } from "./types";
import { $, AbstractHelper } from './AbstractHelper';
import { assert } from "./utils";
import styles from './IntentSystem.module.css';
import { AbstractEvent } from "./AbstractEvent";

function createCaptureCallback(interestHooks: any) {
  return function captureCallback(this: AnyAbstractNode, event: AbstractEvent) {
    const q54 = event.tr;
    const currentContext = new cu(this, event, q54);
    event.tr = currentContext;
    let bubble1: any;
    let bubble2: any;
    const value = interestHooks[this.type]
    if (value) {
      const { hook, fe86 } = value;
      bubble1 = hook && hook.call(this, event);
      bubble2 = fe86 && fe86.call(this, event, this.state);
    }

    return function bubbleCallback(this: AnyAbstractNode) {
      if (bubble2) {
        bubble2.call(this);
      }
      if (bubble1) {
        bubble1.call(this);
      }
      currentContext.replace();
      event.tr = q54;
    };
  };
}

class cu {
  private w77: AnyAbstractNode[] = [];

  constructor(
    private current: AnyAbstractNode,
    private event: AbstractEvent,
    public q54?: cu,
  ) {}

  p11() {
    return this.w77.length ? this.w77[this.w77.length - 1] : undefined;
  }

  push(node: AnyAbstractNode) {
    this.w77.push(node);
  }

  replaced = false;

  replace() {
    if (!this.replaced) {
      this.replaced = true;

      const { c1: start, cI: end } = this.event;
      if (start != null && end != null) {
        assert(start <= end);
        abstractSplice(this.current, start, end - start + 1, this.w77);
      }
    }
  }
}

export class IntentSystem {
  private vcw: AbstractHelper;
  private wev: vwec;

  // private continuousKeyDown = 0;

  constructor(i0: AnyAbstractNode, private gs: AbstractConfigs) {
    this.vcw = $(i0);
    this.wev = new vwec(i0, gs);
    (window as any).sel = this.wev;
  }

  uo0(event: React.KeyboardEvent) {
    // this.continuousKeyDown = 0;
  }

  u0o(event: React.KeyboardEvent) {
    const { wev: abstractSelection, gs, vcw: helper } = this;
    const { nativeEvent } = event;
    assert(helper.current);
    // this.continuousKeyDown += 1;

    if (isMoveForward(nativeEvent)) {
      console.log('Uy');
      abstractSelection.Uy(false, 1, nativeEvent);
    } else if (isMoveBackward(nativeEvent)) {
      console.log('backward');
      abstractSelection.vie(false, 1, nativeEvent);
    } else if (isExtendForward(nativeEvent)) {
      console.log('extend Uy');
      abstractSelection.Uy(true, 1, nativeEvent);
    } else if (isExtendBackward(nativeEvent)) {
      console.log('extend backward');
      abstractSelection.vie(true, 1, nativeEvent);
    } else if (isBold(nativeEvent) || isItalic(nativeEvent)) {
      const formatBold = isBold(nativeEvent);
      const formatItalic = isItalic(nativeEvent);

      const keys: TextQueryStylePayload['keys'] = [];
      if (formatBold) {
        keys.push('fontWeight');
        console.log('bold');
      }
      if (formatItalic) {
        keys.push('fontStyle');
        console.log('italic');
      }

      event.preventDefault();
      const { Q0 } = this.wev;
      if (Q0) {
        const { anchor, focus, j754: isForward } = Q0;
        const result = helper.bv<AbstractText['eo']['style'], TextQueryStylePayload>({
          type: 11,
          fO: { keys },
        }, {
          Uy: true,
          oe87: anchor.node,
          nb67: focus.node,
          gs: this.gs,
        });
        if (result) {
          console.log(result);
          const boldBool = result.fontWeight === undefined;
          const italicBool = result.fontStyle === undefined;

          const [left, right] = isForward ? [anchor, focus] : [focus, anchor];
          const leftNode = $(left.node).jc887().current || left.node;
          const rightNode = $(right.node).kvf9768().current || right.node;

          const fO: { style: any; excludes: AnyAbstractNode[] } = {
            style: {},
            excludes: [],
          };
          if (leftNode !== left.node) {
            fO.excludes.push(leftNode);
          }
          if (rightNode !== right.node) {
            fO.excludes.push(rightNode);
          }
          if (formatBold) {
            fO.style.fontWeight = boldBool ? 600 : undefined;
          }
          if (formatItalic) {
            fO.style.fontStyle = italicBool ? 'italic' : undefined;
          }

          const nextRange: w5 | undefined = helper.bv({
            type: 10,
            fO,
          }, {
            Uy: true,
            Q0: Q0,
            oe87: leftNode,
            nb67: rightNode,
            gs: this.gs,
            createCaptureCallback,
          });
          assert(nextRange);
          Promise.resolve().then(() => {
            this.wev.rab(nextRange);
          });
        }
      }
    } else if (isDeleteBackward(nativeEvent) || isDeleteForward(nativeEvent)) {
      const deleteForward = !!isDeleteForward(nativeEvent);
      console.log(deleteForward ? 'delete backward' : 'delete Uy');
      nativeEvent.preventDefault();
      const { Q0 } = this.wev;
      if (Q0) {
        const { j754: isForward, fmke: collapsed, anchor, focus } = Q0;
        let deleteRange: w5 | undefined;
        if (collapsed) {
          deleteRange = helper.bv<w5, SelectionMovePayload>({
            type: 2,
            fO: { i976: true, Uy: deleteForward, gO0: 1 },
          }, {
            Q0,
            Uy: isForward,
            oe87: anchor.node,
            nb67: focus.node,
            gs: this.gs,
          });
        } else {
          deleteRange = Q0;
        }

        if (deleteRange && !deleteRange.fmke) {
          const abstractRange: w5 = helper.bv({
            type: 8,
            fO: {
              key: '',
            },
          }, {
            Q0: deleteRange,
            Uy: true,
            oe87: deleteRange.anchor.node,
            nb67: deleteRange.focus.node,
            gs,
            O0: event,
            createCaptureCallback,
          }) as w5;
          assert(abstractRange);
          Promise.resolve().then(() => {
            this.wev.rab(abstractRange);
          });
        }
      }
    } else if (isSplitBlock(nativeEvent)) {
      event.preventDefault();
      const { Q0 } = abstractSelection;
      if (Q0) {
        const { anchor, focus, j754: isForward } = Q0;
        helper.bv({
          type: 9,
          fO: undefined,
        }, {
          Q0,
          Uy: true,
          oe87: anchor.node,
          nb67: focus.node,
          gs,
        });
      }
    } else if (
      !event.metaKey && (
        event.keyCode === 32 ||
        (event.keyCode >= 48 && event.keyCode <= 90) ||
        (event.keyCode >= 186 && event.keyCode <= 223)
      )
    ) {
      console.log(event.key);
      const { Q0 } = abstractSelection;
      if (Q0) {
        const { anchor, focus, j754: isForward } = Q0;
        event.preventDefault();
        const abstractRange: w5 = helper.bv({
          type: 8,
          fO: {
            key: event.key,
          },
        }, {
          Q0,
          Uy: true,
          oe87: anchor.node,
          nb67: focus.node,
          gs,
          O0: event,
          createCaptureCallback,
        }) as w5;
        assert(abstractRange);
        Promise.resolve().then(() => {
          this.wev.rab(abstractRange);
        });
      }
    }
  }

  ccwe() {
    this.wev.rwsv();
  }
}

interface IntentProps {
  editable: boolean;
  i0: AnyAbstractNode;
  gs: AbstractConfigs;
  children?: ReactNode;
}

function useIntentSystem(i0: AnyAbstractNode, gs: AbstractConfigs) {
  return useMemo(() => {
    const intentSystem = new IntentSystem(i0, gs);
    return {
      cvvf: intentSystem.u0o.bind(intentSystem),
      cvfv: intentSystem.uo0.bind(intentSystem),
      cfvv: intentSystem.ccwe.bind(intentSystem),
    };
  }, [gs, i0]);
}

export function UserIntention({ editable, i0, gs, children }: IntentProps) {
  const {
    cvvf,
    cvfv,
    cfvv,
  } = useIntentSystem(i0, gs);

  useEffect(() => {
    document.addEventListener('selectionchange', cfvv);
    return () => {
      document.removeEventListener('selectionchange', cfvv);
    };
  }, [cfvv]);

  return (
    <div
      className={styles.editable}
      spellCheck={false}
      tabIndex={0}
      contentEditable={editable}
      suppressContentEditableWarning
      onKeyDown={cvvf}
      onKeyUp={cvfv}
    >
      {children}
    </div>
  );
}
