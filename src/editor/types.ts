import { CSSProperties } from "react";
import { AbstractNode, AnyAbstractNode } from "./AbstractNode";
import { AbstractEvent } from "./AbstractEvent";
import { AbstractBaseEvent } from "./AbstractBaseEvent";
import { AbstractRange } from "./AbstractSelection";

export enum DocType {
  Doc,
  List,
  ListItem,
  Paragraph,
  Text,
}

export type Align = 'left' | 'center' | 'right';

export type NonEmptyArray<T> = [T, ...T[]];

// export interface IDocNode {
//   type: Partial<DocType>;
//   id: string;
//   childNodes?: IDocNode[];
// }

// export interface IDocText {
//   type: DocType.Text;
//   id: string;
//   content: string;
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
//   type: DocType.Paragraph;
//   id: string;
//   childNodes: NonEmptyArray<IDocText>;
//   align?: Align;
// }

// export interface IDocListItem {
//   type: DocType.ListItem,
//   id: string;
//   childNodes: NonEmptyArray<IDocParagraph>;
//   order: string;
// }

// export interface IDocList {
//   type: DocType.List;
//   id: string;
//   childNodes: NonEmptyArray<IDocParagraph | IDocList | IDocListItem>;
//   orderList: boolean;
// }

// export interface IDoc {
//   type: DocType.Doc;
//   id: string;
//   childNodes: NonEmptyArray<IDocParagraph | IDocList>;
// }

export type AbstractDoc = AbstractNode<DocType.Doc, undefined, NonEmptyArray<AbstractList | AbstractParagraph>>;

export interface AbstractListData {
  orderList: boolean;
}
export type AbstractList = AbstractNode<DocType.List, AbstractListData, NonEmptyArray<AbstractParagraph | AbstractList | AbstractlistItem>>;

export interface AbstractListItemData {
  order: string;
}
export type AbstractlistItem = AbstractNode<DocType.ListItem, AbstractListItemData, NonEmptyArray<AbstractParagraph>>;

export interface AbstractParagraphData {
  align?: Align;
}
export type AbstractParagraph = AbstractNode<DocType.Paragraph, AbstractParagraphData | undefined, NonEmptyArray<AbstractText>>;

export interface AbstractTextData {
  content: string;
  style?: {
    fontFamily?: CSSProperties['fontFamily'];
    fontStyle?: CSSProperties['fontStyle'];
    fontSize?: CSSProperties['fontSize'];
    color?: CSSProperties['color'];
    fontWeight?: CSSProperties['fontWeight'];
    textDecoration?: CSSProperties['textDecoration'];
  };
}
export type AbstractText = AbstractNode<DocType.Text, AbstractTextData, undefined>;

export enum AbstractEventType {
  // Selection
  SelectionSynchronize,
  SelectionForward,
  SelectionBackward,
  SelectionExtendForward,
  SelectionExtendBackward,
  SelectionRendering,

  // Text
  TextStyle,
  TextDelete,
  TextDeleteBackward,
  TextInsert,

  // Paragraph
}

export interface SelectionSynchronizePayload {
  range: AbstractRange | null;
  isCollapsed: boolean;
  anchorNode: Node;
  anchorOffset: number;
  focusNode: Node;
  focusOffset: number;
  anchorAbstractNode: AnyAbstractNode;
  focusAbstractNode: AnyAbstractNode;
}

export interface SelectionRenderingPayload {
  range: AbstractRange;
}

export interface RawAbstractEvent<T = any> {
  type: AbstractEventType,
  payload: T;
}

export type AbstractConfigs = {
  [docType in DocType]: {
    onHook(this: AbstractNode<docType>, abstractEvent: AbstractEvent): void | BubbleCallback;
  };
};

export type DocConfigs = {
  [docType in DocType]: {
    readonly View: React.FC<any>;
  }
};

export type EditorConfigs = AbstractConfigs & DocConfigs;

export type BubbleCallback = () => void;

export type CaptureCallback<T extends AbstractBaseEvent> = (node: AnyAbstractNode, abstractEvent: T) => void | BubbleCallback;

export enum AbstractPosition {
  Disconnected,
  Same,
  Preceding,
  Following,
  Contains,
  ContainedBy,
}

export type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

export interface Reference<T, P = undefined> {
  current: T | P;
}
