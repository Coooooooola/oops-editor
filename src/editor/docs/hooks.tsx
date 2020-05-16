import React, { useRef, useEffect, useContext, useState, useMemo } from 'react';
import { AbstractNode, AnyAbstractNode } from '../AbstractNode';
import { documentContext } from './DocDocument';
import { DocType } from '../types';

export function useConnectAbstractNode<T extends Element>(abstractNode: AnyAbstractNode) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (ref.current) {
      (ref.current as any).__ABSTRACT__ = abstractNode;
    }
  }, [abstractNode]);
  return ref;
}

export function useNextDocViews(context: AnyAbstractNode) {
  const { configs: docConfigs } = useContext(documentContext);
  const [abstractNodes, setAbstractNodes] = useState(context.abstractNodes);
  useEffect(() => {
    context.renderAbstractNodes = setAbstractNodes;
    return () => {
      context.renderAbstractNodes = undefined;
    };
  }, [context]);
  return useMemo(() => {
    if (!abstractNodes) {
      return null;
    }
    return abstractNodes.map(node => {
      const { View } = docConfigs[node.type];
      return <View key={node.id} context={node} />;
    });
  }, [abstractNodes, docConfigs]);
}

export function useAbstractNodeData<T extends AbstractNode<P, U>, P extends DocType, U>(abstractNode: T) {
  const [data, setData] = useState<T['data']>(abstractNode.data);
  useEffect(() => {
    abstractNode.render = setData;
    return () => {
      abstractNode.render = undefined;
    }
  }, [abstractNode]);
  return data;
}

export function useOnViewHook<T extends DocType>(node: AbstractNode<T>, onViewHook: NonNullable<AbstractNode<T>['onViewHook']>) {
  useEffect(() => {
    node.onViewHook = onViewHook;
  }, [node, onViewHook]);
}
