import React, { ReactNode, useMemo, useEffect, forwardRef } from "react";
import {
  AbstractSelection,
  AbstractRange,
  AbstractPoint,
} from "./AbstractSelection";
import {
  isMoveForward,
  isMoveBackward,
  isExtendForward,
  isExtendBackward,
  isBold,
  isItalic,
  isDeleteBackward,
  isDeleteForward,
  isSplitBlock,
} from "./hotkeys";
import { AbstractNode, AnyAbstractNode, abstractSplice } from "./AbstractNode";
import {
  AbstractConfigs,
  AbstractEventType,
  SelectionMovePayload,
  TextQueryStylePayload,
  AbstractText,
} from "./types";
import { $, AbstractHelper } from "./AbstractHelper";
import { assert } from "./utils";
import styles from "./IntentSystem.module.css";
import { AbstractEvent } from "./AbstractEvent";

function createCaptureCallback(interestHooks: any) {
  return function captureCallback(this: AnyAbstractNode, event: AbstractEvent) {
    const parentContext = event.context;
    const currentContext = new Context(this, event, parentContext);
    event.context = currentContext;
    let bubble1: any;
    let bubble2: any;
    const value = interestHooks[this.type];
    if (value) {
      const { hook, browserHook } = value;
      bubble1 = hook && hook.call(this, event);
      bubble2 = browserHook && browserHook.call(this, event, this.state);
    }

    return function bubbleCallback(this: AnyAbstractNode) {
      if (bubble2) {
        bubble2.call(this);
      }
      if (bubble1) {
        bubble1.call(this);
      }
      currentContext.replace();
      event.context = parentContext;
    };
  };
}

class Context {
  private sliceNodes: AnyAbstractNode[] = [];

  constructor(
    private current: AnyAbstractNode,
    private event: AbstractEvent,
    public parentContext?: Context
  ) {}

  peek() {
    return this.sliceNodes.length
      ? this.sliceNodes[this.sliceNodes.length - 1]
      : undefined;
  }

  push(node: AnyAbstractNode) {
    this.sliceNodes.push(node);
  }

  pop() {
    return this.sliceNodes.pop();
  }

  replaced = false;

  replace() {
    if (!this.replaced) {
      this.replaced = true;

      const { leftChildIndex: start, rightChildIndex: end } = this.event;
      if (start != null && end != null) {
        assert(start <= end);
        const sn = this.event.forward
          ? this.sliceNodes
          : this.sliceNodes.reverse();
        abstractSplice(this.current, start, end - start + 1, sn);
      }
    }
  }
}

export class IntentSystem {
  private helper: AbstractHelper;
  private abstractSelection: AbstractSelection;

  // private continuousKeyDown = 0;

  constructor(root: AnyAbstractNode, private configs: AbstractConfigs) {
    this.helper = $(root);
    this.abstractSelection = new AbstractSelection(root, configs);
    (window as any).sel = this.abstractSelection;
  }

  nextKeyUp(event: React.KeyboardEvent) {
    // this.continuousKeyDown = 0;
  }

  nextKeyDown(event: React.KeyboardEvent) {
    const { abstractSelection, configs, helper } = this;
    const { nativeEvent } = event;
    assert(helper.current);
    // this.continuousKeyDown += 1;

    if (isMoveForward(nativeEvent)) {
      console.log("forward");
      abstractSelection.forward(false, 1, nativeEvent);
    } else if (isMoveBackward(nativeEvent)) {
      console.log("backward");
      abstractSelection.backward(false, 1, nativeEvent);
    } else if (isExtendForward(nativeEvent)) {
      console.log("extend forward");
      abstractSelection.forward(true, 1, nativeEvent);
    } else if (isExtendBackward(nativeEvent)) {
      console.log("extend backward");
      abstractSelection.backward(true, 1, nativeEvent);
    } else if (isBold(nativeEvent) || isItalic(nativeEvent)) {
      const formatBold = isBold(nativeEvent);
      const formatItalic = isItalic(nativeEvent);

      const keys: TextQueryStylePayload["keys"] = [];
      if (formatBold) {
        keys.push("fontWeight");
        console.log("bold");
      }
      if (formatItalic) {
        keys.push("fontStyle");
        console.log("italic");
      }

      event.preventDefault();
      const { range } = this.abstractSelection;
      if (range) {
        const { anchor, focus, isForward } = range;
        const result = helper.dispatchEvent<
          AbstractText["data"]["style"],
          TextQueryStylePayload
        >(
          {
            type: AbstractEventType.TextQueryStyle,
            payload: { keys },
          },
          {
            forward: true,
            point1: anchor.node,
            point2: focus.node,
            configs: this.configs,
          }
        );
        if (result) {
          console.log(result);
          const boldBool = result.fontWeight === undefined;
          const italicBool = result.fontStyle === undefined;

          const [left, right] = isForward ? [anchor, focus] : [focus, anchor];
          const leftNode = $(left.node).prevSibling().current || left.node;
          const rightNode = $(right.node).nextSibling().current || right.node;

          const payload: { style: any; excludes: AnyAbstractNode[] } = {
            style: {},
            excludes: [],
          };
          if (leftNode !== left.node) {
            payload.excludes.push(leftNode);
          }
          if (rightNode !== right.node) {
            payload.excludes.push(rightNode);
          }
          if (formatBold) {
            payload.style.fontWeight = boldBool ? 600 : undefined;
          }
          if (formatItalic) {
            payload.style.fontStyle = italicBool ? "italic" : undefined;
          }

          const nextRange: AbstractRange | undefined = helper.dispatchEvent(
            {
              type: AbstractEventType.TextFormatStyle,
              payload,
            },
            {
              forward: true,
              range: range,
              point1: leftNode,
              point2: rightNode,
              configs: this.configs,
              createCaptureCallback,
            }
          );
          assert(nextRange);
          Promise.resolve().then(() => {
            this.abstractSelection.updateRange(nextRange);
          });
        }
      }
    } else if (isDeleteBackward(nativeEvent) || isDeleteForward(nativeEvent)) {
      const deleteForward = !!isDeleteForward(nativeEvent);
      console.log(deleteForward ? "delete backward" : "delete forward");
      nativeEvent.preventDefault();
      const { range } = this.abstractSelection;
      if (range) {
        const { isForward, collapsed, anchor, focus } = range;
        let deleteRange: AbstractRange | undefined;
        if (collapsed) {
          deleteRange = helper.dispatchEvent<
            AbstractRange,
            SelectionMovePayload
          >(
            {
              type: AbstractEventType.SelectionMove,
              payload: { shift: true, forward: deleteForward, step: 1 },
            },
            {
              range,
              forward: isForward,
              point1: anchor.node,
              point2: focus.node,
              configs: this.configs,
            }
          );
        } else {
          deleteRange = range;
        }

        if (deleteRange && !deleteRange.collapsed) {
          const abstractRange: AbstractRange = helper.dispatchEvent(
            {
              type: AbstractEventType.ContentReplace,
              payload: {
                key: "",
                prevParagraph: null,
              },
            },
            {
              range: deleteRange,
              forward: false,
              point1: deleteRange.anchor.node,
              point2: deleteRange.focus.node,
              configs,
              originEvent: event,
              createCaptureCallback,
            }
          ) as AbstractRange;
          assert(abstractRange);
          const rright = helper.dispatchEvent(
            {
              type: AbstractEventType.SelectionTryMove,
              payload: {
                step: 0,
                forward: true,
              },
            },
            {
              initiator: abstractRange.focus.node,
              point1: abstractRange.focus.node,
              forward: true,
              configs: configs,
            }
          ) as AbstractPoint;
          if (rright) {
            const fr = new AbstractRange(abstractRange.anchor, rright);
            const f1: AbstractRange | undefined = helper.dispatchEvent(
              {
                type: AbstractEventType.TextFormatStyle,
                payload: {
                  style: {},
                  excludes: [],
                },
              },
              {
                forward: true,
                range: fr,
                point1: fr.anchor.node,
                point2: fr.focus.node,
                configs: this.configs,
                createCaptureCallback,
              }
            );
            assert(f1);
            console.log(f1)
            const collapsedr = new AbstractRange(f1.anchor, f1.anchor);
            Promise.resolve().then(() => {
              this.abstractSelection.updateRange(collapsedr);
            });
            return;
          }
          Promise.resolve().then(() => {
            this.abstractSelection.updateRange(abstractRange);
          });
        }
      }
    } else if (isSplitBlock(nativeEvent)) {
      event.preventDefault();
      const { range } = abstractSelection;
      if (range) {
        const { isForward, collapsed } = range;
        let nextRange: AbstractRange;
        if (!collapsed) {
          nextRange = helper.dispatchEvent(
            {
              type: AbstractEventType.ContentReplace,
              payload: {
                key: "",
              },
            },
            {
              range: range,
              forward: true,
              point1: range.anchor.node,
              point2: range.focus.node,
              configs,
              originEvent: event,
              createCaptureCallback,
            }
          ) as AbstractRange;
        } else {
          nextRange = range;
        }
        const newRange = helper.dispatchEvent(
          {
            type: AbstractEventType.TextEnter,
            payload: {
              prevText: null,
              splitedText: null,
              splitedParagraph: null,
            },
          },
          {
            range: nextRange,
            forward: true,
            point1: nextRange.anchor.node,
            point2: nextRange.focus.node,
            configs,
          }
        ) as AbstractRange;
        assert(newRange);
        Promise.resolve().then(() => {
          this.abstractSelection.updateRange(newRange);
        });
      }
    } else if (
      !event.metaKey &&
      (event.keyCode === 32 ||
        (event.keyCode >= 48 && event.keyCode <= 90) ||
        (event.keyCode >= 186 && event.keyCode <= 223))
    ) {
      console.log(event.key);
      const { range } = abstractSelection;
      if (range) {
        const { anchor, focus, isForward } = range;
        event.preventDefault();
        const abstractRange: AbstractRange = helper.dispatchEvent(
          {
            type: AbstractEventType.ContentReplace,
            payload: {
              key: event.key,
            },
          },
          {
            range,
            forward: false,
            point1: anchor.node,
            point2: focus.node,
            configs,
            originEvent: event,
            createCaptureCallback,
          }
        ) as AbstractRange;
        assert(abstractRange);
        Promise.resolve().then(() => {
          this.abstractSelection.updateRange(abstractRange);
        });
      }
    }
  }

  nextSelectionChange() {
    this.abstractSelection.synchronizeWindowSelection();
  }
}

interface IntentProps {
  editable: boolean;
  root: AnyAbstractNode;
  configs: AbstractConfigs;
  children?: ReactNode;
}

function useIntentSystem(root: AnyAbstractNode, configs: AbstractConfigs) {
  return useMemo(() => {
    const intentSystem = new IntentSystem(root, configs);
    return {
      nextKeyDown: intentSystem.nextKeyDown.bind(intentSystem),
      nextKeyUp: intentSystem.nextKeyUp.bind(intentSystem),
      nextSelectionChange: intentSystem.nextSelectionChange.bind(intentSystem),
    };
  }, [configs, root]);
}

export function UserIntention({
  editable,
  root,
  configs,
  children,
}: IntentProps) {
  const { nextKeyDown, nextKeyUp, nextSelectionChange } = useIntentSystem(
    root,
    configs
  );

  useEffect(() => {
    document.addEventListener("selectionchange", nextSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", nextSelectionChange);
    };
  }, [nextSelectionChange]);

  return (
    <div
      className={styles.editable}
      spellCheck={false}
      tabIndex={0}
      contentEditable={editable}
      suppressContentEditableWarning
      onKeyDown={nextKeyDown}
      onKeyUp={nextKeyUp}
    >
      {children}
    </div>
  );
}
