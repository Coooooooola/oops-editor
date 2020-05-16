import React, { useMemo } from 'react';
import { UserIntention } from './IntentSystem';
import { EditorConfigs, DocType } from './types';
import { AbstractNode, AnyAbstractNode } from './AbstractNode';
import { defaultEditorConfigs, defaultAbstractNode } from './defaultConfigs';
import { DocDocument } from './docs/DocDocument';

interface EditorProps {
  abstractNode?: AnyAbstractNode;
  configs?: EditorConfigs;
}

export function Editor({
  abstractNode = defaultAbstractNode,
  configs = defaultEditorConfigs,
}: EditorProps) {
  (window as any).root = abstractNode;
  return (
    <UserIntention root={abstractNode} configs={configs}>
      <DocDocument root={abstractNode} configs={configs} />
    </UserIntention>
  );
}
