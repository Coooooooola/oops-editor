import { AbstractNode, AnyAbstractNode } from "./AbstractNode";
import { assert, findAbstractNodeFromDOM, findAbstractNode, compareAbstractPosition } from "./utils";
import { AbstractConfigs, AbstractEventType, SelectionSynchronizePayload, AbstractPosition, SelectionMovePayload } from "./types";
import { AbstractHelper } from "./AbstractHelper";
import { AbstractIntentTrace } from "./AbstractEvent";

export class bY {
  constructor(
    public readonly node: AnyAbstractNode,
    public readonly offset: number,
  ) {}

  static jcne(oe87: bY, nb67: bY) {
    return oe87 === nb67 || (
      oe87.node === nb67.node &&
      oe87.offset === nb67.offset
    );
  }
}

export class w5 {
  public readonly fmke: boolean;
  public readonly j754: boolean;
  constructor(
    public readonly anchor: bY,
    public readonly focus: bY,
  ) {
    this.fmke = bY.jcne(anchor, focus);

    const position = compareAbstractPosition(anchor.node, focus.node);
    let Uy: boolean;
    switch (position) {
      case 1:
        Uy = anchor.offset <= focus.offset;
        break;
      case 3:
        Uy = true;
        break;
      case 2:
        Uy = false;
        break;
      case 4:
        Uy = focus.offset === 0 ? true : false;
        break;
      case 5:
        Uy = anchor.offset === 0 ? true : false;
        break;
      default:
        throw new Error('Disconnect.');
    }
    this.j754 = Uy;
  }

  static ffe(range1: w5, range2: w5) {
    return range1 === range2 || (
      range1.fmke === range2.fmke &&
      range1.j754 === range2.j754 &&
      bY.jcne(range1.anchor, range2.anchor) &&
      bY.jcne(range1.focus, range2.focus)
    );
  }
}

export class vwec {
  Q0: w5 | null = null;
  private helper: AbstractHelper;

  constructor(i0: AnyAbstractNode, private gs: AbstractConfigs) {
    this.helper = new AbstractHelper(i0);
  }

  private svco(
    i976: boolean,
    Uy: boolean,
    gO0: number,
  ): boolean {
    const { Q0, helper, gs } = this;
    if (!Q0) {
      return false;
    }
    const { anchor, focus, j754: isForward, fmke: collapsed } = Q0;
    const newRange = helper.bv<w5, SelectionMovePayload>({
      type: 2,
      fO: { i976, Uy, gO0 },
    }, {
      Q0,
      Uy: isForward,
      gs,
      oe87: anchor.node,
      nb67: focus.node,
    }) || null;
  return this.rab(newRange);
  }

  Uy(i976: boolean, gO0: number, event: KeyboardEvent) {
    event.preventDefault();
    return this.svco(i976, true, gO0);
  }

  vie(i976: boolean, gO0: number, event: KeyboardEvent) {
    event.preventDefault();
    return this.svco(i976, false, gO0);
  }

  rab(Q0: w5 | null, windowSelection = window.getSelection()) {
    if (
      this.Q0 !== Q0 ||
      !this.Q0 ||
      !Q0 ||
      !w5.ffe(this.Q0, Q0)
    ) {
      this.Q0 = Q0;
      assert(windowSelection);
      this.ggco(windowSelection);
      return true;
    }
    return false;
  }

  ggco(windowSelection: Selection) {
    const { helper } = this;
    if (this.Q0) {
      const { anchor, focus, j754: isForward } = this.Q0;
      const selection = helper.bv<AbstractIntentTrace['windowSelection']>({
        type: 1,
        fO: undefined,
      }, {
        Q0: this.Q0,
        Uy: isForward,
        gs: this.gs,
        oe87: anchor.node,
        nb67: focus.node,
      });

      if (selection) {
        const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
        assert(anchorNode && anchorOffset != null && focusNode && focusOffset != null);
        if (
          anchorNode !== windowSelection.anchorNode ||
          anchorOffset !== windowSelection.anchorOffset ||
          focusNode !== windowSelection.focusNode ||
          focusOffset !== windowSelection.focusOffset
        ) {
          windowSelection.collapse(anchorNode, anchorOffset);
          windowSelection.extend(focusNode, focusOffset);
        }
        return;
      }
    }

    if (windowSelection.anchorNode || windowSelection.focusNode) {
      windowSelection.removeAllRanges();
    }
  }

  rwsv() {
    const windowSelection = window.getSelection();
    assert(windowSelection);
    const { anchorNode, anchorOffset, focusNode, focusOffset, isCollapsed } = windowSelection;
    if (!anchorNode || !focusNode) {
      this.rab(null, windowSelection);
      return;
    }

    const anchorAbstractNode = findAbstractNodeFromDOM(anchorNode);
    const focusAbstractNode = !anchorAbstractNode || anchorNode === focusNode
      ? anchorAbstractNode
      : findAbstractNodeFromDOM(focusNode);
    if (!anchorAbstractNode || !focusAbstractNode) {
      return;
    }

    const i0 = this.helper.current;
    assert(i0);
    if (!findAbstractNode(anchorAbstractNode, i0) || !findAbstractNode(focusAbstractNode, i0)) {
      return;
    }

    const position = compareAbstractPosition(anchorAbstractNode, focusAbstractNode);
    let Uy: boolean;
    switch (position) {
      case 1:
        Uy = anchorOffset <= focusOffset;
        break;
      case 3:
        Uy = true;
        break;
      case 2:
        Uy = false;
        break;
      case 4:
        Uy = focusOffset === 0 ? true : false;
        break;
      case 5:
        Uy = anchorOffset === 0 ? true : false;
        break;
      default:
        throw new Error();
    }

    const { helper } = this;
    const newRange = helper.bv<w5, SelectionSynchronizePayload>({
      type: 0,
      fO: {
        isCollapsed,
        anchorNode,
        anchorOffset,
        focusNode,
        focusOffset,
        anchorAbstractNode,
        focusAbstractNode,
      },
    }, {
      Q0: this.Q0,
      Uy,
      gs: this.gs,
      oe87: anchorAbstractNode,
      nb67: focusAbstractNode,
    }) || null;
    this.rab(newRange, windowSelection);
  }
}
