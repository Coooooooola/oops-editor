import { EditorConfigs, DocType, AbstractDoc, AbstractParagraph, AbstractText } from "./types";
import { randomId } from "./utils";
import { ListView } from "./DocViews";
import { DocView, DocConfig } from "./docs/Doc";
import { ListItemView } from "./docs/ListItem";
import { ParagraphView, paragraphConfig } from "./docs/Paragraph";
import { TextConfig, createAbstractText } from "./docs/Text";
import { linkAbstractNode } from "./AbstractNode";

export const defaultEditorConfigs: EditorConfigs = {
  [DocType.Doc]: DocConfig,
  [DocType.List]: {
    View: ListView,
    hooks: {},
    browserHooks: {},
  },
  [DocType.ListItem]: {
    View: ListItemView,
    hooks: {},
    browserHooks: {},
  },
  [DocType.Paragraph]: paragraphConfig,
  [DocType.Text]: TextConfig,
};

// const text1: AbstractText = {
//   type: DocType.Text,
//   id: randomId(),
//   data: {
//     content: '0123456789',
//     style: {
//       color: 'darkred',
//       fontSize: 60,
//     },
//   },
// };

// const text2: AbstractText = {
//   type: DocType.Text,
//   id: randomId(),
//   data: {
//     content: '0123456789',
//     style: {
//       color: 'red',
//       fontSize: 80,
//     }
//   },
// };

// const text3: AbstractText = {
//   type: DocType.Text,
//   id: randomId(),
//   data: {
//     content: '0123456789',
//     style: {
//       color: 'green',
//       fontSize: 70,
//     }
//   },
// };

const text1 = createAbstractText({
  data: {
    content: '0123456789',
    style: {
      color: 'darkred',
      fontSize: 60,
    },
  },
});
const text2 = createAbstractText({
  data: {
    content: '0123456789',
    style: {
      color: 'red',
      fontSize: 80,
    },
  },
});
const text3 = createAbstractText({
  data: {
    content: '0123456789',
    style: {
      color: 'green',
      fontSize: 70,
    },
  },
});

const texts: any[] = [];
const query = new URLSearchParams(document.location.search);
const len = +(query.get('size') || 0) / 2;
for (let i = 0; i < len; i++) {
  texts.push(createAbstractText({
    data: {
      content: '0123456789',
      style: {
        color: 'red',
        fontSize: 80,
      },
    },
  }));
  texts.push(createAbstractText({
    data: {
      content: '0123456789',
      style: {
        color: 'green',
        fontSize: 70,
      },
    },
  }));
}
if (query.get('log') !== 'true') {
  (window.console as any)._log = window.console.log;
  // window.console.log = () => {};
}

const paragraph: AbstractParagraph = {
  type: DocType.Paragraph,
  id: randomId(),
  data: undefined,
  abstractNodes: [text1, text2, text3, ...texts],
};

const defaultAbstractNode: AbstractDoc = {
  type: DocType.Doc,
  id: randomId(),
  data: undefined,
  abstractNodes: [paragraph],
};

linkAbstractNode(defaultAbstractNode);

export {
  defaultAbstractNode,
};

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
