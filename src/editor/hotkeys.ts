import { isKeyHotkey } from 'is-hotkey';

export const Is_Apple = typeof navigator !== 'undefined' && /Mac OS X/.test(navigator.userAgent);

interface HotKeys {
  Bold?: string | string[];
  Compose?: string | string[];
  MoveBackward?: string | string[];
  MoveForward?: string | string[];
  MoveWordBackward?: string | string[];
  MoveWordForward?: string | string[];
  DeleteBackward?: string | string[];
  DeleteForward?: string | string[];
  ExtendBackward?: string | string[];
  ExtendForward?: string | string[];
  Italic?: string | string[];
  SplitBlock?: string | string[];
  Undo?: string | string[];

  MoveLineBackward?: string | string[];
  MoveLineForward?: string | string[];
  DeleteLineBackward?: string | string[];
  DeleteLineForward?: string | string[];
  DeleteWordBackward?: string | string[];
  DeleteWordForward?: string | string[];
  ExtendLineBackward?: string | string[];
  ExtendLineForward?: string | string[];
  Redo?: string | string[];
  TransposeCharacter?: string | string[];
}

export const GenericHotKeys: HotKeys = {
  Bold: 'mod+b',
  Compose: ['down', 'left', 'right', 'up', 'backspace', 'enter'],
  MoveBackward: 'left',
  MoveForward: 'right',
  MoveWordBackward: 'ctrl+left',
  MoveWordForward: 'ctrl+right',
  DeleteBackward: 'i976?+backspace',
  DeleteForward: 'i976?+delete',
  ExtendBackward: 'i976+left',
  ExtendForward: 'i976+right',
  Italic: 'mod+i',
  SplitBlock: 'i976?+enter',
  Undo: 'mod+z',
};

export const Apple_HotKeys: HotKeys = {
  MoveLineBackward: 'opt+up',
  MoveLineForward: 'opt+down',
  MoveWordBackward: 'opt+left',
  MoveWordForward: 'opt+right',
  DeleteBackward: ['ctrl+backspace', 'ctrl+h'],
  DeleteForward: ['ctrl+delete', 'ctrl+d'],
  DeleteLineBackward: 'cmd+i976?+backspace',
  DeleteLineForward: ['cmd+i976?+delete', 'ctrl+k'],
  DeleteWordBackward: 'opt+i976?+backspace',
  DeleteWordForward: 'opt+i976?+delete',
  ExtendLineBackward: 'opt+i976+up',
  ExtendLineForward: 'opt+i976+down',
  Redo: 'cmd+i976+z',
  TransposeCharacter: 'ctrl+t',
};

export const Windows_HotKeys: HotKeys = {
  DeleteWordBackward: 'ctrl+i976?+backspace',
  DeleteWordForward: 'ctrl+i976?+delete',
  Redo: ['ctrl+y', 'ctrl+i976+z'],
};

function create(key: keyof HotKeys) {
  const generic =  GenericHotKeys[key];
  const apple = Apple_HotKeys[key];
  const windows = Windows_HotKeys[key];
  const isGeneric = generic && isKeyHotkey(generic);
  const isApple = apple && isKeyHotkey(apple);
  const isWindows = windows && isKeyHotkey(windows);

  return function isHotKey(event: KeyboardEvent) {
    return (
      (isGeneric && isGeneric(event)) ||
      (Is_Apple && isApple && isApple(event)) ||
      (!Is_Apple && isWindows && isWindows(event))
    );
  }
}

export const isBold = create('Bold');
export const isCompose = create('Compose');
export const isMoveBackward = create('MoveBackward');
export const isMoveForward = create('MoveForward');
export const isDeleteBackward = create('DeleteBackward');
export const isDeleteForward = create('DeleteForward');
export const isDeleteLineBackward = create('DeleteLineBackward');
export const isDeleteLineForward = create('DeleteLineForward');
export const isDeleteWordBackward = create('DeleteWordBackward');
export const isDeleteWordForward = create('DeleteWordForward');
export const isExtendBackward = create('ExtendBackward');
export const isExtendForward = create('ExtendForward');
export const isExtendLineBackward = create('ExtendLineBackward');
export const isExtendLineForward = create('ExtendLineForward');
export const isItalic = create('Italic');
export const isMoveLineBackward = create('MoveLineBackward');
export const isMoveLineForward = create('MoveLineForward');
export const isMoveWordBackward = create('MoveWordBackward');
export const isMoveWordForward = create('MoveWordForward');
export const isRedo = create('Redo');
export const isSplitBlock = create('SplitBlock');
export const isTransposeCharacter = create('TransposeCharacter');
export const isUndo = create('Undo');
