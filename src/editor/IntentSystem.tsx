import React, { ReactNode, useMemo, useEffect } from "react";
import { AbstractSelection } from "./AbstractSelection";
import { isMoveForward, isMoveBackward, isExtendForward, isExtendBackward } from './hotkeys';
import { AbstractNode } from "./AbstractNode";
import { AbstractConfigs } from "./types";

export class IntentSystem {
  private abstractSelection: AbstractSelection;

  constructor(root: AbstractNode, configs: AbstractConfigs) {
    this.abstractSelection = new AbstractSelection(root, configs);
  }

  nextKeyDown(event: React.KeyboardEvent) {
    const { nativeEvent } = event;

    if (isMoveForward(nativeEvent)) {
      console.log('forward');
      this.abstractSelection.forward(false);
    } else if (isMoveBackward(nativeEvent)) {
      console.log('backward');
      this.abstractSelection.backward(false);
    } else if (isExtendForward(nativeEvent)) {
      console.log('extend forward');
      this.abstractSelection.forward(true);
    } else if (isExtendBackward(nativeEvent)) {
      console.log('extend backward');
      this.abstractSelection.backward(true);
    } else {
    }
  }

  nextSelectionChange() {
    this.abstractSelection.synchronizeWindowSelection();
  }
}

interface IntentProps {
  root: AbstractNode;
  configs: AbstractConfigs;
  children?: ReactNode;
}

function useIntentSystem(root: AbstractNode, configs: AbstractConfigs) {
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
