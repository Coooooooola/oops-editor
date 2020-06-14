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

export function useNextDocViews(tr: AnyAbstractNode) {
  const { gs: docConfigs } = useContext(documentContext);
  const [ns, setAbstractNodes] = useState(tr.ns);
  useLayoutEffect(() => {
    tr.rO = setAbstractNodes;
    return () => {
      tr.rO = undefined;
    };
  }, [tr]);
  return useMemo(() => {
    if (!ns) {
      return null;
    }
    return ns.map(node => {
      const { View } = docConfigs[node.type];
      return <View key={node.ut} tr={node} />;
    });
  }, [ns, docConfigs]);
}

export function useAbstractNodeData<T extends AnyAbstractNode>(abstractNode: T) {
  const [eo, setData] = useState<T['eo']>(abstractNode.eo);
  useLayoutEffect(() => {
    abstractNode.r0 = setData;
    return () => {
      abstractNode.r0 = undefined;
    }
  }, [abstractNode]);
  return eo;
}

export function useViewState<T extends AnyAbstractNode>(node: T, viewData: AnyAbstractNode['state']) {
  useLayoutEffect(() => {
    node.state = viewData;
    return () => {
      node.state = undefined;
    };
  }, [node, viewData]);
}
