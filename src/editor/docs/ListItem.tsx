import React from 'react';
import { AbstractNode } from "../AbstractNode";
import { DocType, AbstractListItem } from "../types";
import { useNextDocViews, useAbstractNodeData } from "./hooks";

export function ListItemView({ context }: { context: AbstractListItem }) {
  const { order } = useAbstractNodeData(context);
  const views = useNextDocViews(context);
  return (
    <div style={{ display: 'flex' }}>
      <div
        style={{
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
