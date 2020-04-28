import React, { useMemo } from 'react';
import { UserIntention } from './IntentSystem';
import { IDoc, EditorConfigs } from './types';
import { AbstractNode } from './AbstractNode';
import { defaultDoc, defaultEditorConfigs } from './defaultConfigs';
import { DocDocument } from './docs/DocDocument';

interface EditorProps {
  doc?: IDoc;
  abstractNode?: AbstractNode;
  configs?: EditorConfigs;
}

export function Editor({
  doc = defaultDoc,
  abstractNode: _abstractNode,
  configs = defaultEditorConfigs,
}: EditorProps) {
  const abstractNode = useMemo(
    () => _abstractNode || new AbstractNode(doc, null),
    [_abstractNode, doc],
  );
  return (
    <UserIntention
      root={abstractNode}
      configs={configs}
    >
      <DocDocument
        root={abstractNode}
        configs={configs}
      />
    </UserIntention>
  );
}
