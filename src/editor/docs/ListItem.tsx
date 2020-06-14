import React from 'react';
import { AbstractNode } from "../AbstractNode";
import { DocType, AbstractListItem } from "../types";
import { useNextDocViews, useAbstractNodeData } from "./hooks";

export function ListItemView({ tr }: { tr: AbstractListItem }) {
  const { order } = useAbstractNodeData(tr);
  const views = useNextDocViews(tr);
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
