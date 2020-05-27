import React, { ReactNode, useMemo, useEffect } from "react";
import { AbstractSelection, AbstractRange } from "./AbstractSelection";
import { isMoveForward, isMoveBackward, isExtendForward, isExtendBackward, isBold, isItalic, isDeleteBackward, isDeleteForward, isSplitBlock } from './hotkeys';
import { AbstractNode, AnyAbstractNode } from "./AbstractNode";
import { AbstractConfigs, AbstractEventType, SelectionMovePayload } from "./types";
import { $, AbstractHelper } from './AbstractHelper';
import { assert } from "./utils";
import styles from './IntentSystem.module.css';

export class IntentSystem {
  private helper: AbstractHelper;
  private abstractSelection: AbstractSelection;

  private continuousKeyDown = 0;

  constructor(root: AnyAbstractNode, private configs: AbstractConfigs) {
    this.helper = $(root);
    this.abstractSelection = new AbstractSelection(root, configs);
  }

  nextKeyUp(event: React.KeyboardEvent) {
    this.continuousKeyDown = 0;
  }

  nextKeyDown(event: React.KeyboardEvent) {
    const { abstractSelection, configs, helper } = this;
    const { nativeEvent } = event;
    assert(helper.current);
    this.continuousKeyDown += 1;

    if (isMoveForward(nativeEvent)) {
      console.log('forward');
      abstractSelection.forward(false, 1, nativeEvent);
    } else if (isMoveBackward(nativeEvent)) {
      console.log('backward');
      abstractSelection.backward(false, 1, nativeEvent);
    } else if (isExtendForward(nativeEvent)) {
      console.log('extend forward');
      abstractSelection.forward(true, 1, nativeEvent);
    } else if (isExtendBackward(nativeEvent)) {
      console.log('extend backward');
      abstractSelection.backward(true, 1, nativeEvent);
    } else if (isBold(nativeEvent)) {
      console.log('bold');
      event.preventDefault();
    } else if (isItalic(nativeEvent)) {
      console.log('italic');
    } else if (isDeleteBackward(nativeEvent) || isDeleteForward(nativeEvent)) {
      const deleteForward = !!isDeleteForward(nativeEvent);
      console.log(deleteForward ? 'delete backward' : 'delete forward');
      nativeEvent.preventDefault();
      const { range } = this.abstractSelection;
      if (range) {
        const { isForward, collapsed, anchor, focus } = range;
        let deleteRange: AbstractRange | undefined;
        if (collapsed) {
          deleteRange = helper.dispatchEvent<AbstractRange, SelectionMovePayload>({
            type: AbstractEventType.SelectionMove,
            payload: { shift: true, forward: deleteForward, step: 1 },
          }, {
            range,
            forward: isForward,
            point1: anchor.node,
            point2: focus.node,
            configs: this.configs,
          });
        } else {
          deleteRange = range;
        }

        if (deleteRange && !deleteRange.collapsed) {
          const abstractRange: AbstractRange = helper.dispatchEvent({
            type: AbstractEventType.ContentReplace,
            payload: {
              key: '',
            },
          }, {
            range: deleteRange,
            forward: deleteRange.isForward,
            point1: deleteRange.anchor.node,
            point2: deleteRange.focus.node,
            configs,
            originEvent: event,
          }) as AbstractRange;
          assert(abstractRange);
          Promise.resolve().then(() => {
            this.abstractSelection.updateRange(abstractRange);
          });
        }
      }
    } else if (isSplitBlock(nativeEvent)) {
      event.preventDefault();
      const { range } = abstractSelection;
      if (range) {
        const { anchor, focus, isForward } = range;
        helper.dispatchEvent({
          type: AbstractEventType.TextEnter,
          payload: undefined,
        }, {
          range,
          forward: true,
          point1: anchor.node,
          point2: focus.node,
          configs,
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
      const { range } = abstractSelection;
      if (range) {
        const { anchor, focus, isForward } = range;
        event.preventDefault();
        const abstractRange: AbstractRange = helper.dispatchEvent({
          type: AbstractEventType.ContentReplace,
          payload: {
            key: event.key,
          },
        }, {
          range,
          forward: isForward,
          point1: anchor.node,
          point2: focus.node,
          configs,
          originEvent: event,
        }) as AbstractRange;
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

export function UserIntention({ editable, root, configs, children }: IntentProps) {
  const {
    nextKeyDown,
    nextKeyUp,
    nextSelectionChange,
  } = useIntentSystem(root, configs);

  useEffect(() => {
    document.addEventListener('selectionchange', nextSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', nextSelectionChange);
    };
  }, [nextSelectionChange]);

  return (
    <div
      className={styles.editable}
      spellCheck={false}
      tabIndex={-1}
      contentEditable={editable}
      suppressContentEditableWarning
      onKeyDown={nextKeyDown}
      onKeyUp={nextKeyUp}
    >
      {children}
    </div>
  );
}
