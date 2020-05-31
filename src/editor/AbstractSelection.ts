import { AbstractNode, AnyAbstractNode } from "./AbstractNode";
import { assert, findAbstractNodeFromDOM, findAbstractNode, compareAbstractPosition } from "./utils";
import { AbstractConfigs, AbstractEventType, SelectionSynchronizePayload, AbstractPosition, SelectionMovePayload } from "./types";
import { AbstractHelper } from "./AbstractHelper";
import { AbstractIntentTrace } from "./AbstractEvent";

export class AbstractPoint {
  constructor(
    public readonly node: AnyAbstractNode,
    public readonly offset: number,
  ) {}

  static equals(point1: AbstractPoint, point2: AbstractPoint) {
    return point1 === point2 || (
      point1.node === point2.node &&
      point1.offset === point2.offset
    );
  }
}

export class AbstractRange {
  public readonly collapsed: boolean;
  public readonly isForward: boolean;
  constructor(
    public readonly anchor: AbstractPoint,
    public readonly focus: AbstractPoint,
  ) {
    this.collapsed = AbstractPoint.equals(anchor, focus);

    const position = compareAbstractPosition(anchor.node, focus.node);
    let forward: boolean;
    switch (position) {
      case AbstractPosition.Same:
        forward = anchor.offset <= focus.offset;
        break;
      case AbstractPosition.Following:
        forward = true;
        break;
      case AbstractPosition.Preceding:
        forward = false;
        break;
      case AbstractPosition.Contains:
        forward = focus.offset === 0 ? true : false;
        break;
      case AbstractPosition.ContainedBy:
        forward = anchor.offset === 0 ? true : false;
        break;
      default:
        throw new Error('Disconnect.');
    }
    this.isForward = forward;
  }

  static equals(range1: AbstractRange, range2: AbstractRange) {
    return range1 === range2 || (
      range1.collapsed === range2.collapsed &&
      range1.isForward === range2.isForward &&
      AbstractPoint.equals(range1.anchor, range2.anchor) &&
      AbstractPoint.equals(range1.focus, range2.focus)
    );
  }
}

export class AbstractSelection {
  range: AbstractRange | null = null;
  private helper: AbstractHelper;

  constructor(root: AnyAbstractNode, private configs: AbstractConfigs) {
    this.helper = new AbstractHelper(root);
  }

  private moveSelection(
    shift: boolean,
    forward: boolean,
    step: number,
  ): boolean {
    const { range, helper, configs } = this;
    if (!range) {
      return false;
    }
    const { anchor, focus, isForward, collapsed } = range;
    const newRange = helper.dispatchEvent<AbstractRange, SelectionMovePayload>({
      type: AbstractEventType.SelectionMove,
      payload: { shift, forward, step },
    }, {
      range,
      forward: isForward,
      configs,
      point1: anchor.node,
      point2: focus.node,
    }) || null;
  return this.updateRange(newRange);
  }

  forward(shift: boolean, step: number, event: KeyboardEvent) {
    event.preventDefault();
    return this.moveSelection(shift, true, step);
  }

  backward(shift: boolean, step: number, event: KeyboardEvent) {
    event.preventDefault();
    return this.moveSelection(shift, false, step);
  }

  updateRange(range: AbstractRange | null, windowSelection = window.getSelection()) {
    if (
      this.range !== range ||
      !this.range ||
      !range ||
      !AbstractRange.equals(this.range, range)
    ) {
      this.range = range;
      assert(windowSelection);
      this.renderWindowSelection(windowSelection);
      return true;
    }
    return false;
  }

  renderWindowSelection(windowSelection: Selection) {
    const { helper } = this;
    if (this.range) {
      const { anchor, focus, isForward } = this.range;
      const selection = helper.dispatchEvent<AbstractIntentTrace['windowSelection']>({
        type: AbstractEventType.SelectionRendering,
        payload: undefined,
      }, {
        range: this.range,
        forward: isForward,
        configs: this.configs,
        point1: anchor.node,
        point2: focus.node,
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

  synchronizeWindowSelection() {
    const windowSelection = window.getSelection();
    assert(windowSelection);
    const { anchorNode, anchorOffset, focusNode, focusOffset, isCollapsed } = windowSelection;
    if (!anchorNode || !focusNode) {
      this.updateRange(null, windowSelection);
      return;
    }

    const anchorAbstractNode = findAbstractNodeFromDOM(anchorNode);
    const focusAbstractNode = !anchorAbstractNode || anchorNode === focusNode
      ? anchorAbstractNode
      : findAbstractNodeFromDOM(focusNode);
    if (!anchorAbstractNode || !focusAbstractNode) {
      return;
    }

    const root = this.helper.current;
    assert(root);
    if (!findAbstractNode(anchorAbstractNode, root) || !findAbstractNode(focusAbstractNode, root)) {
      return;
    }

    const position = compareAbstractPosition(anchorAbstractNode, focusAbstractNode);
    let forward: boolean;
    switch (position) {
      case AbstractPosition.Same:
        forward = anchorOffset <= focusOffset;
        break;
      case AbstractPosition.Following:
        forward = true;
        break;
      case AbstractPosition.Preceding:
        forward = false;
        break;
      case AbstractPosition.Contains:
        forward = focusOffset === 0 ? true : false;
        break;
      case AbstractPosition.ContainedBy:
        forward = anchorOffset === 0 ? true : false;
        break;
      default:
        throw new Error();
    }

    const { helper } = this;
    const newRange = helper.dispatchEvent<AbstractRange, SelectionSynchronizePayload>({
      type: AbstractEventType.SelectionSynchronize,
      payload: {
        isCollapsed,
        anchorNode,
        anchorOffset,
        focusNode,
        focusOffset,
        anchorAbstractNode,
        focusAbstractNode,
      },
    }, {
      range: this.range,
      forward,
      configs: this.configs,
      point1: anchorAbstractNode,
      point2: focusAbstractNode,
    }) || null;
    this.updateRange(newRange, windowSelection);
  }
}
