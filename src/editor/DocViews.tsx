import React, { useContext, useMemo, useState } from 'react';
import { AbstractNode, AnyAbstractNode } from './AbstractNode';
import { documentContext } from './docs/DocDocument';
import { DocType, AbstractList } from './types';

function useNextDocViews(context: AnyAbstractNode) {
  const { configs: docConfigs } = useContext(documentContext);
  const [nodes, setNodes] = useState(context.abstractNodes);
  context.renderAbstractNodes = setNodes;
  return useMemo(() => {
    if (!nodes) {
      return null;
    }
    return nodes.map(node => {
      const { View } = docConfigs[node.type];
      return <View key={node.id} context={node as any} />;
    });
  }, [nodes, docConfigs]);
}

export function ListView({ context }: { context: AbstractList }) {
  const views = useNextDocViews(context);
  return <div>{views}</div>;
}
