import React, { useContext, useMemo, useState } from 'react';
import { AbstractNode, AnyAbstractNode } from './AbstractNode';
import { documentContext } from './docs/EditorDocument';
import { DocType, AbstractList } from './types';

function useNextDocViews(tr: AnyAbstractNode) {
  const { gs: docConfigs } = useContext(documentContext);
  const [nodes, setNodes] = useState(tr.ns);
  tr.rO = setNodes;
  return useMemo(() => {
    if (!nodes) {
      return null;
    }
    return nodes.map(node => {
      const { View } = docConfigs[node.type];
      return <View key={node.ut} tr={node as any} />;
    });
  }, [nodes, docConfigs]);
}

export function ListView({ tr }: { tr: AbstractList }) {
  const views = useNextDocViews(tr);
  return <div>{views}</div>;
}
