import React from 'react';
import { AbstractNode } from "../AbstractNode";
import { IDocListItem } from "../types";
import { useNextDocViews, useAbstractNodeData } from "./hooks";

export function ListItemView({ context }: { context: AbstractNode<IDocListItem> }) {
  const { order, align, fontSize } = useAbstractNodeData(context);
  const justifyContent = align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start';
  const views = useNextDocViews(context);
  return (
    <div style={{ display: 'flex', justifyContent }}>
      <div
        style={{
          fontSize,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'baseline',
        }}
      >
        <div contentEditable={false} style={{ userSelect: 'none', paddingRight: 5 }}>{order}.</div>
        {views}
      </div>
    </div>
  );
}
