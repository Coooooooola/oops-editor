import { EditorConfigs, DocType, AbstractDoc, AbstractParagraph, AbstractText } from "./types";
import { randomId } from "./utils";
import { ListView } from "./DocViews";
import { DocView, DocConfig } from "./docs/Doc";
import { ListItemView } from "./docs/ListItem";
import { ParagraphView, paragraphConfig } from "./docs/Paragraph";
import { TextConfig, createAbstractText } from "./docs/Text";
import { linkAbstractNode } from "./AbstractNode";

export const defaultEditorConfigs: EditorConfigs = {
  [0]: DocConfig,
  [1]: {
    View: ListView,
    hooks: {},
    w007O: {},
  },
  [2]: {
    View: ListItemView,
    hooks: {},
    w007O: {},
  },
  [3]: paragraphConfig,
  [4]: TextConfig,
};

// const text1: AbstractText = {
//   type: 4,
//   ut: randomId(),
//   eo: {
//     e868: '0123456789',
//     style: {
//       color: 'darkred',
//       fontSize: 60,
//     },
//   },
// };

// const text2: AbstractText = {
//   type: 4,
//   ut: randomId(),
//   eo: {
//     e868: '0123456789',
//     style: {
//       color: 'red',
//       fontSize: 80,
//     }
//   },
// };

// const text3: AbstractText = {
//   type: 4,
//   ut: randomId(),
//   eo: {
//     e868: '0123456789',
//     style: {
//       color: 'green',
//       fontSize: 70,
//     }
//   },
// };

const text1 = createAbstractText({
  eo: {
    e868: '0123456789',
    style: {
      color: 'darkred',
      fontSize: 60,
    },
  },
});
const text2 = createAbstractText({
  eo: {
    e868: '0123456789',
    style: {
      color: 'red',
      fontSize: 80,
    },
  },
});
const text3 = createAbstractText({
  eo: {
    e868: '0123456789',
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
    eo: {
      e868: '0123456789',
      style: {
        color: 'red',
        fontSize: 80,
      },
    },
  }));
  texts.push(createAbstractText({
    eo: {
      e868: '0123456789',
      style: {
        color: 'green',
        fontSize: 70,
      },
    },
  }));
}
if (query.get('log') !== 'true') {
  (window.console as any)._log = window.console.log;
  window.console.log = () => {};
}
if (query.get('no-reload') !== 'true') {
  setInterval(() => {
    window.location.reload(true);
  }, 1000 * 60 * 5);
}

const paragraph: AbstractParagraph = {
  type: 3,
  ut: randomId(),
  eo: undefined,
  ns: [text1, text2, text3, ...texts],
};

const defaultAbstractNode: AbstractDoc = {
  type: 0,
  ut: randomId(),
  eo: undefined,
  ns: [paragraph],
};

linkAbstractNode(defaultAbstractNode);

export {
  defaultAbstractNode,
};

// export const defaultDoc = {
//   type: 0,
//   ut: randomId(),
//   childNodes: [
//     {
//       type: 1,
//       ut: randomId(),
//       childNodes: [
//         {
//           type: 2,
//           ut: randomId(),
//           order: '1',
//           fontSize: 30,
//           childNodes: [
//             { type: 3, ut: randomId(), childNodes: [
//               { type: 4, ut: randomId(), e868: 'I am a long long long long long long long line.', style: { fontFamily: 'initial' } },
//             ] },
//           ],
//         },
//         {
//           type: 2,
//           ut: randomId(),
//           order: '2',
//           align: 'center',
//           childNodes: [
//             { type: 3, ut: randomId(), childNodes: [
//               { type: 4, ut: randomId(), e868: 'I AM Center.', style: { color: 'red' } },
//             ] },
//           ],
//         },
//         {
//           type: 2,
//           ut: randomId(),
//           order: '3',
//           align: 'right',
//           childNodes: [
//             { type: 3, ut: randomId(), childNodes: [
//               { type: 4, ut: randomId(), e868: 'I AM OOOOOOOOPS', style: { textDecoration: 'underline wavy' } },
//             ] },
//           ],
//         },
//         {
//           type: 3,
//           ut: randomId(),
//           align: 'center',
//           childNodes: [
//             { type: 4, ut: randomId(), e868: 'I ', style: { fontFamily: 'initial', fontSize: 30 } },
//             { type: 4, ut: randomId(), e868: 'am ', style: { fontFamily: 'cursive' } },
//             { type: 4, ut: randomId(), e868: 'a ', style: { color: 'red' } },
//             { type: 4, ut: randomId(), e868: 'cute ', style: { textDecoration: 'underline wavy' } },
//             { type: 4, ut: randomId(), e868: 'editor.', style: { fontStyle: 'italic' } },
//           ],
//         },
//       ],
//       orderList: true,
//     },
//     {
//       type: 3,
//       ut: randomId(),
//       childNodes: [
//         { type: 4, ut: randomId(), e868: 'I ', style: { fontFamily: 'initial', fontSize: 30 } },
//         { type: 4, ut: randomId(), e868: 'am ', style: { fontFamily: 'cursive' } },
//         { type: 4, ut: randomId(), e868: 'a ', style: { color: 'red' } },
//         { type: 4, ut: randomId(), e868: 'cute ', style: { textDecoration: 'underline wavy' } },
//         { type: 4, ut: randomId(), e868: 'editor.', style: { fontStyle: 'italic' } },
//       ],
//     },
//   ],
// };
