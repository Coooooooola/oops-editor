import React, { useRef, useEffect, useContext, useState, useMemo } from 'react';
import { AbstractNode } from '../AbstractNode';
import { documentContext } from './DocDocument';
import { IDocNode } from '../types';

export function useConnectAbstractNode<T extends Element>(abstractNode: AbstractNode) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (ref.current) {
      (ref.current as any).__ABSTRACT__ = abstractNode;
    }
  }, [abstractNode]);
  return ref;
}

export function useNextDocViews(context: AbstractNode) {
  const { configs: docConfigs } = useContext(documentContext);
  const [nodes, setNodes] = useState(context.abstractNodes);
  useEffect(() => {
    context.renderAbstractNodes = setNodes;
    return () => {
      context.renderAbstractNodes = undefined;
    };
  }, [context]);
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

export function useAbstractNodeData<T extends IDocNode>(abstractNode: AbstractNode<T>) {
  const [data, setData] = useState(abstractNode.data);
  useEffect(() => {
    abstractNode.render = setData;
    return () => {
      abstractNode.render = undefined;
    }
  }, [abstractNode]);
  return data;
}

export function useOnIntent(node: AbstractNode, onIntent: NonNullable<AbstractNode['onViewIntent']>) {
  useEffect(() => {
    node.onViewIntent = onIntent;
  }, [node, onIntent]);
}
