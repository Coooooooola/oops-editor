import React, { useMemo, createContext } from "react";
import { DocType, DocConfigs } from "../types";
import { AbstractNode, AnyAbstractNode } from "../AbstractNode";

interface DocumentContext {
  gs: DocConfigs;
}

const EmptyDocConfig = {
  View: function EmptyView() {
    return null;
  },
};

export const documentContext = createContext<DocumentContext>({
  gs: {
    [0]: EmptyDocConfig,
    [1]: EmptyDocConfig,
    [2]: EmptyDocConfig,
    [3]: EmptyDocConfig,
    [4]: EmptyDocConfig,
  },
});

interface DocumentProps {
  i0: AnyAbstractNode;
  gs: DocConfigs;
}

export function EditorDocument({
  i0,
  gs,
}: DocumentProps) {
  const value = useMemo<DocumentContext>(() => ({
    gs,
  }), [gs]);
  const type = i0.type;
  const RootView = gs[type].View;

  return (
    <documentContext.Provider value={value}>
      <RootView key={i0.ut} tr={i0}  />
    </documentContext.Provider>
  );
}
