import React, { useMemo } from 'react';
import { UserIntention } from './IntentSystem';
import { EditorConfigs, DocType } from './types';
import { AbstractNode, AnyAbstractNode } from './AbstractNode';
import { defaultEditorConfigs, defaultAbstractNode } from './defaultConfigs';
import { EditorDocument } from './docs/EditorDocument';

interface EditorProps {
  editable?: boolean;
  abstractNode?: AnyAbstractNode;
  configs?: EditorConfigs;
}

export function Editor({
  editable = true,
  abstractNode = defaultAbstractNode,
  configs = defaultEditorConfigs,
}: EditorProps) {
  (window as any).root = abstractNode;
  return (
    <UserIntention editable={editable} root={abstractNode} configs={configs}>
      <EditorDocument root={abstractNode} configs={configs} />
    </UserIntention>
  );
}
