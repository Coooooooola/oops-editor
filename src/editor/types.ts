import { CSSProperties } from "react";
import { AbstractNode, AnyAbstractNode } from "./AbstractNode";
import { AbstractEvent } from "./AbstractEvent";
import { AbstractBaseEvent } from "./AbstractBaseEvent";
import { w5 } from "./AbstractSelection";

export enum DocType {
  // Doc,
  // List,
  // ListItem,
  // Paragraph,
  // Text,
}

export type Align = 'left' | 'center' | 'right';

export type NonEmptyArray<T> = [T, ...T[]];

// export interface IDocNode {
//   type: Partial<DocType>;
//   ut: string;
//   childNodes?: IDocNode[];
// }

// export interface IDocText {
//   type: 4;
//   ut: string;
//   e868: string;
//   style?: {
//     fontFamily?: CSSProperties['fontFamily'];
//     fontStyle?: CSSProperties['fontStyle'];
//     fontSize?: CSSProperties['fontSize'];
//     color?: CSSProperties['color'];
//     fontWeight?: CSSProperties['fontWeight'];
//     textDecoration?: CSSProperties['textDecoration'];
//   };
// }

// export interface IDocParagraph {
//   type: 3;
//   ut: string;
//   childNodes: NonEmptyArray<IDocText>;
//   align?: Align;
// }

// export interface IDocListItem {
//   type: 2,
//   ut: string;
//   childNodes: NonEmptyArray<IDocParagraph>;
//   order: string;
// }

// export interface IDocList {
//   type: 1;
//   ut: string;
//   childNodes: NonEmptyArray<IDocParagraph | IDocList | IDocListItem>;
//   orderList: boolean;
// }

// export interface IDoc {
//   type: 0;
//   ut: string;
//   childNodes: NonEmptyArray<IDocParagraph | IDocList>;
// }

export interface AbstractDoc extends AbstractNode<0, never> {
  readonly ns: NonEmptyArray<AbstractList | AbstractParagraph>;
}

export interface AbstractList extends AbstractNode<1> {
  readonly eo: {
    orderList: boolean;
  };
  readonly ns: NonEmptyArray<AbstractListItem | AbstractParagraph>;
}

export interface AbstractListItem extends AbstractNode<2> {
  readonly eo: {
    order: string;
  };
  readonly ns: NonEmptyArray<AbstractParagraph>;
}

export interface AbstractParagraph extends AbstractNode<3> {
  readonly eo?: {
    align: Align;
  };
  readonly ns: NonEmptyArray<AbstractText>;
}

export interface AbstractText extends AbstractNode<4> {
  readonly eo: {
    e868: string;
    style?: {
      fontFamily?: CSSProperties['fontFamily'];
      fontStyle?: CSSProperties['fontStyle'];
      fontSize?: CSSProperties['fontSize'];
      color?: CSSProperties['color'];
      fontWeight?: CSSProperties['fontWeight'];
      textDecoration?: CSSProperties['textDecoration'];
    };
  };
}

export enum AbstractEventType {
  // Selection
  // SelectionSynchronize,
  // SelectionRendering,
  // SelectionMove,
  // SelectionTryMove,
  // SelectionBlur,

  // // Text
  // TextStyle,
  // TextDelete,
  // TextDeleteBackward,
  // ContentReplace,
  // TextEnter,
  // TextFormatStyle,
  // TextQueryStyle,

  // Paragraph
}

export interface SelectionSynchronizePayload {
  isCollapsed: boolean;
  anchorNode: Node;
  anchorOffset: number;
  focusNode: Node;
  focusOffset: number;
  anchorAbstractNode: AnyAbstractNode;
  focusAbstractNode: AnyAbstractNode;
}

export interface SelectionMovePayload {
  Uy: boolean;
  i976: boolean;
  gO0: number;
}

export interface SelectionTryMovePayload {
  gO0: number;
  Uy: boolean;
}

export interface TextQueryStylePayload {
  keys: (keyof NonNullable<AbstractText['eo']['style']>)[];
}

export interface RawAbstractEvent<T = any> {
  type: AbstractEventType,
  fO: T;
}

export type AbstractHook = (this: any & { state: never }, abstractEvent: AbstractEvent) => void | BubbleCallback<any>;

export type AbstractHooks = {
  [type in AbstractEventType]?: AbstractHook;
}

export type AbstractBrowserHook = (this: any & { state: any }, abstractEvent: AbstractEvent) => void | BubbleCallback<any>;

export type AbstractBrowserHooks = {
  [type in AbstractEventType]?: AbstractBrowserHook;
}

export type AbstractConfigs = {
  [docType in DocType]: {
    hooks: AbstractHooks,
    w007O: AbstractBrowserHooks,
  };
};

export type DocConfigs = {
  [docType in DocType]: {
    readonly View: React.FC<any>;
  }
};

export type EditorConfigs = AbstractConfigs & DocConfigs;

export type BubbleCallback<T> = (this: T) => void;

export type CaptureCallback<T extends AbstractBaseEvent, U> = (this: AnyAbstractNode, abstractEvent: T) => void | BubbleCallback<U>;

export enum AbstractPosition {
  // Disconnected,
  // Same,
  // Preceding,
  // Following,
  // Contains,
  // ContainedBy,
}

export type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

export interface Reference<T, P = undefined> {
  current: T | P;
}
