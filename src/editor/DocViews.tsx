import React, { useContext, useMemo, useState } from 'react';
import { AbstractNode } from './AbstractNode';
import { documentContext } from './docs/DocDocument';
import { IDocList } from './types';

function useNextDocViews(context: AbstractNode) {
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

export function ListView({ context }: { context: AbstractNode<IDocList> }) {
  const views = useNextDocViews(context);
  return <div>{views}</div>;
}
