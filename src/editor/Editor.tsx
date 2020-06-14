import React, { useMemo } from 'react';
import { UserIntention } from './IntentSystem';
import { EditorConfigs, DocType } from './types';
import { AbstractNode, AnyAbstractNode } from './AbstractNode';
import { defaultEditorConfigs, defaultAbstractNode } from './defaultConfigs';
import { EditorDocument } from './docs/EditorDocument';

interface EditorProps {
  editable?: boolean;
  abstractNode?: AnyAbstractNode;
  gs?: EditorConfigs;
}

export function Editor({
  editable = true,
  abstractNode = defaultAbstractNode,
  gs = defaultEditorConfigs,
}: EditorProps) {
  (window as any).i0 = abstractNode;
  return (
    <UserIntention editable={editable} i0={abstractNode} gs={gs}>
      <EditorDocument i0={abstractNode} gs={gs} />
    </UserIntention>
  );
}
