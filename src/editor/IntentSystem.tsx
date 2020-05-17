import React, { ReactNode, useMemo, useEffect } from "react";
import { AbstractSelection } from "./AbstractSelection";
import { isMoveForward, isMoveBackward, isExtendForward, isExtendBackward, isBold, isItalic, isDeleteBackward, isDeleteForward, isSplitBlock } from './hotkeys';
import { AbstractNode, AnyAbstractNode } from "./AbstractNode";
import { AbstractConfigs, AbstractEventType } from "./types";
import { $, AbstractHelper } from './AbstractHelper';
import { assert } from "./utils";

export class IntentSystem {
  private helper: AbstractHelper;
  private abstractSelection: AbstractSelection;

  constructor(root: AnyAbstractNode, private configs: AbstractConfigs) {
    this.helper = $(root);
    this.abstractSelection = new AbstractSelection(root, configs);
  }

  nextKeyDown(event: React.KeyboardEvent) {
    const { abstractSelection, configs, helper } = this;
    const { nativeEvent } = event;
    assert(helper.current);

    if (isMoveForward(nativeEvent)) {
      console.log('forward');
      abstractSelection.forward(false, (window as any).step || 1, nativeEvent);
    } else if (isMoveBackward(nativeEvent)) {
      console.log('backward');
      abstractSelection.backward(false, (window as any).step || 1, nativeEvent);
    } else if (isExtendForward(nativeEvent)) {
      console.log('extend forward');
      abstractSelection.forward(true, (window as any).step || 1, nativeEvent);
    } else if (isExtendBackward(nativeEvent)) {
      console.log('extend backward');
      abstractSelection.backward(true, (window as any).step || 1, nativeEvent);
    } else if (isBold(nativeEvent)) {
      console.log('bold');
    } else if (isItalic(nativeEvent)) {
      console.log('italic');
    } else if (isDeleteBackward(nativeEvent)) {
      console.log('delete backward');
    } else if (isDeleteForward(nativeEvent)) {
      console.log('delete forward');
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
    } else if (event.keyCode >= 65 && event.keyCode <= 90) {
      console.log(event.key);
      const { range } = abstractSelection;
      if (range) {
        const { anchor, focus, isForward } = range;
        event.preventDefault();
        helper.dispatchEvent({
          type: AbstractEventType.TextInsert,
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
        });
      }
    }
  }

  nextSelectionChange() {
    this.abstractSelection.synchronizeWindowSelection();
  }
}

interface IntentProps {
  root: AnyAbstractNode;
  configs: AbstractConfigs;
  children?: ReactNode;
}

function useIntentSystem(root: AnyAbstractNode, configs: AbstractConfigs) {
  return useMemo(() => {
    const intentSystem = new IntentSystem(root, configs);
    return {
      nextKeyDown: intentSystem.nextKeyDown.bind(intentSystem),
      nextSelectionChange: intentSystem.nextSelectionChange.bind(intentSystem),
    };
  }, [configs, root]);
}

export function UserIntention({ root, configs, children }: IntentProps) {
  const {
    nextKeyDown,
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
      contentEditable
      suppressContentEditableWarning
      style={{ outline: 'none' }}
      onKeyDown={nextKeyDown}
    >
      {children}
    </div>
  );
}
