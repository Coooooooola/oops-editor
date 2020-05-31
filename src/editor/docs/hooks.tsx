import React, { useRef, useEffect, useContext, useState, useMemo, useLayoutEffect } from 'react';
import { AbstractNode, AnyAbstractNode } from '../AbstractNode';
import { documentContext } from './EditorDocument';
import { DocType } from '../types';

export function useConnectAbstractNode<T extends Element>(abstractNode: AnyAbstractNode) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    if (ref.current) {
      (ref.current as any).__ABSTRACT__ = abstractNode;
    }
  }, [abstractNode]);
  return ref;
}

export function useNextDocViews(context: AnyAbstractNode) {
  const { configs: docConfigs } = useContext(documentContext);
  const [abstractNodes, setAbstractNodes] = useState(context.abstractNodes);
  useLayoutEffect(() => {
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

export function useAbstractNodeData<T extends AnyAbstractNode>(abstractNode: T) {
  const [data, setData] = useState<T['data']>(abstractNode.data);
  useLayoutEffect(() => {
    abstractNode.render = setData;
    return () => {
      abstractNode.render = undefined;
    }
  }, [abstractNode]);
  return data;
}

export function useViewState<T extends AnyAbstractNode>(node: T, viewData: AnyAbstractNode['state']) {
  useLayoutEffect(() => {
    node.state = viewData;
    return () => {
      node.state = undefined;
    };
  }, [node, viewData]);
}
