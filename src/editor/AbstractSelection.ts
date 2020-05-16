import { AbstractNode, AnyAbstractNode } from "./AbstractNode";
import { assert, findAbstractNodeFromDOM, findAbstractNode, compareAbstractPosition } from "./utils";
import { AbstractConfigs, AbstractEventType, SelectionSynchronizePayload, AbstractPosition, SelectionRenderingPayload } from "./types";
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
  constructor(
    public readonly anchor: AbstractPoint,
    public readonly focus: AbstractPoint,
    public readonly collapsed: boolean,
    public readonly isForward: boolean,
  ) {}

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
    const type = shift
      ? (forward ? AbstractEventType.SelectionExtendForward : AbstractEventType.SelectionExtendBackward)
      : (forward ? AbstractEventType.SelectionForward : AbstractEventType.SelectionBackward);
    const newRange = helper.dispatchEvent<AbstractRange, any>({ type, payload: { range, step } }, {
      forward,
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
    if (this.range) {
      const { anchor, focus, isForward } = this.range;
      const selection = this.helper.dispatchEvent<AbstractIntentTrace['windowSelection'], SelectionRenderingPayload>({
        type: AbstractEventType.SelectionRendering,
        payload: { range: this.range },
      }, {
        forward: isForward,
        configs: this.configs,
        point1: anchor.node,
        point2: focus.node,
      });

      if (selection) {
        const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
        if (
          !windowSelection ||
          windowSelection.anchorNode !== anchorNode ||
          windowSelection.anchorOffset !== anchorOffset ||
          windowSelection.focusNode !== focusNode ||
          windowSelection.focusOffset !== focusOffset
        ) {
          windowSelection.collapse(anchorNode!, anchorOffset!);
          windowSelection.extend(focusNode!, focusOffset!);
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

    const newRange = this.helper.dispatchEvent<AbstractRange, SelectionSynchronizePayload>({
      type: AbstractEventType.SelectionSynchronize,
      payload: {
        range: this.range,
        isCollapsed,
        anchorNode,
        anchorOffset,
        focusNode,
        focusOffset,
        anchorAbstractNode,
        focusAbstractNode,
      },
    }, {
      forward,
      configs: this.configs,
      point1: anchorAbstractNode,
      point2: focusAbstractNode,
    }) || null;
    this.updateRange(newRange, windowSelection);
  }
}
