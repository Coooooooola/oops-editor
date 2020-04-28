import { CSSProperties } from "react";
import { AbstractNode } from "./AbstractNode";
import { AbstractIntent } from "./AbstractIntent";
import { AbstractEvent } from "./AbstractEvent";
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

export interface IDocNode {
  type: Partial<DocType>;
  id: string;
  childNodes?: IDocNode[];
}

export interface IDocText {
  type: DocType.Text;
  id: string;
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

export interface IDocParagraph {
  type: DocType.Paragraph;
  id: string;
  childNodes: NonEmptyArray<IDocText>;
  align?: Align;
}

export interface IDocListItem {
  type: DocType.ListItem,
  id: string;
  childNodes: NonEmptyArray<IDocParagraph>;
  order: string;
  align?: Align;
  fontSize?: CSSProperties['fontSize'];
}

export interface IDocList {
  type: DocType.List;
  id: string;
  childNodes: NonEmptyArray<IDocParagraph | IDocList | IDocListItem>;
  orderList: boolean;
}

export interface IDoc {
  type: DocType.Doc;
  id: string;
  childNodes: NonEmptyArray<IDocParagraph | IDocList>;
}

export enum IntentType {
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
  anchorAbstractNode: AbstractNode;
  focusAbstractNode: AbstractNode;
}

export interface SelectionRenderingPayload {
  range: AbstractRange;
}

export interface Intent<T = any> {
  type: IntentType,
  payload: T;
}

export type AbstractConfigs = {
  [docType in DocType]: {
    onIntent(node: AbstractNode, intent: AbstractIntent): void | BubbleCallback;
  };
};

export type DocConfigs = {
  [docType in DocType]: {
    readonly View: React.FC<any>;
  }
};

export type EditorConfigs = AbstractConfigs & DocConfigs;

export type BubbleCallback = () => void;

export type CaptureCallback<T extends AbstractEvent> = (node: AbstractNode, abstractEvent: T) => void | BubbleCallback;

export enum AbstractPosition {
  Disconnected,
  Same,
  Preceding,
  Following,
  Contains,
  ContainedBy,
}
