import { EditorConfigs, DocType, AbstractDoc, AbstractParagraph, AbstractText } from "./types";
import { randomId } from "./utils";
import { ListView } from "./DocViews";
import { DocView } from "./docs/Doc";
import { ListItemView } from "./docs/ListItem";
import { ParagraphView } from "./docs/Paragraph";
import { TextConfig } from "./docs/Text";

export const defaultEditorConfigs: EditorConfigs = {
  [DocType.Doc]: {
    View: DocView,
    callHook() {},
  },
  [DocType.List]: {
    View: ListView,
    callHook() {},
  },
  [DocType.ListItem]: {
    View: ListItemView,
    callHook() {},
  },
  [DocType.Paragraph]: {
    View: ParagraphView,
    callHook() {},
  },
  [DocType.Text]: TextConfig,
};

const text1: AbstractText = {
  type: DocType.Text,
  id: randomId(),
  data: {
    content: 'ddddeeeeeeeflekfjlwekrflekwerf lwl f ddd   ddd ',
  },
};

const text2: AbstractText = {
  type: DocType.Text,
  id: randomId(),
  data: {
    content: 'mewwrf lkwfe lwkrf lekr flkremf lskdn fkwef o',
    style: {
      color: 'red',
      fontSize: 28,
    }
  },
};


const paragraph: AbstractParagraph = {
  type: DocType.Paragraph,
  id: randomId(),
  data: undefined,
  abstractNodes: [text1, text2],
};
(text1 as any).parent = paragraph;
(text2 as any).parent = paragraph;

export const defaultAbstractNode: AbstractDoc = {
  type: DocType.Doc,
  id: randomId(),
  data: undefined,
  abstractNodes: [paragraph],
};
(paragraph as any).parent = defaultAbstractNode;

// export const defaultDoc = {
//   type: DocType.Doc,
//   id: randomId(),
//   childNodes: [
//     {
//       type: DocType.List,
//       id: randomId(),
//       childNodes: [
//         {
//           type: DocType.ListItem,
//           id: randomId(),
//           order: '1',
//           fontSize: 30,
//           childNodes: [
//             { type: DocType.Paragraph, id: randomId(), childNodes: [
//               { type: DocType.Text, id: randomId(), content: 'I am a long long long long long long long line.', style: { fontFamily: 'initial' } },
//             ] },
//           ],
//         },
//         {
//           type: DocType.ListItem,
//           id: randomId(),
//           order: '2',
//           align: 'center',
//           childNodes: [
//             { type: DocType.Paragraph, id: randomId(), childNodes: [
//               { type: DocType.Text, id: randomId(), content: 'I AM Center.', style: { color: 'red' } },
//             ] },
//           ],
//         },
//         {
//           type: DocType.ListItem,
//           id: randomId(),
//           order: '3',
//           align: 'right',
//           childNodes: [
//             { type: DocType.Paragraph, id: randomId(), childNodes: [
//               { type: DocType.Text, id: randomId(), content: 'I AM OOOOOOOOPS', style: { textDecoration: 'underline wavy' } },
//             ] },
//           ],
//         },
//         {
//           type: DocType.Paragraph,
//           id: randomId(),
//           align: 'center',
//           childNodes: [
//             { type: DocType.Text, id: randomId(), content: 'I ', style: { fontFamily: 'initial', fontSize: 30 } },
//             { type: DocType.Text, id: randomId(), content: 'am ', style: { fontFamily: 'cursive' } },
//             { type: DocType.Text, id: randomId(), content: 'a ', style: { color: 'red' } },
//             { type: DocType.Text, id: randomId(), content: 'cute ', style: { textDecoration: 'underline wavy' } },
//             { type: DocType.Text, id: randomId(), content: 'editor.', style: { fontStyle: 'italic' } },
//           ],
//         },
//       ],
//       orderList: true,
//     },
//     {
//       type: DocType.Paragraph,
//       id: randomId(),
//       childNodes: [
//         { type: DocType.Text, id: randomId(), content: 'I ', style: { fontFamily: 'initial', fontSize: 30 } },
//         { type: DocType.Text, id: randomId(), content: 'am ', style: { fontFamily: 'cursive' } },
//         { type: DocType.Text, id: randomId(), content: 'a ', style: { color: 'red' } },
//         { type: DocType.Text, id: randomId(), content: 'cute ', style: { textDecoration: 'underline wavy' } },
//         { type: DocType.Text, id: randomId(), content: 'editor.', style: { fontStyle: 'italic' } },
//       ],
//     },
//   ],
// };
