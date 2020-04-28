import { Intent, DocType, AbstractConfigs } from "./types";
import { AbstractNode, traverseAbstractNodes } from "./AbstractNode";
import { AbstractEvent } from './AbstractEvent';
import { assert } from "./utils";
import { AbstractIntent } from "./AbstractIntent";

export enum SelectorResult {
  Bail = -1,
  Fail = 0,
  Succuss = 1,
}

type AbstractSelector = (node: AbstractNode) => SelectorResult;

function alwaySuccessSelector() {
  return SelectorResult.Succuss;
}

function docTypeSelector(...docTypes: DocType[]) {
  return function selector(node: AbstractNode) {
    if (docTypes.some(docType => docType === node.type)) {
      return SelectorResult.Succuss;
    }
    return SelectorResult.Fail;
  };
}

function transformToSelector(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractSelector {
  if (arg0 == null) {
    return alwaySuccessSelector;
  }
  if (typeof arg0 === 'function') {
    return arg0;
  }
  return docTypeSelector(arg0, ...args);
}

function findAbstractNode(
  node: AbstractNode,
  selector: AbstractSelector,
  forward: boolean,
): { node: AbstractNode, index: number } | null {
  let ret: { node: AbstractNode, index: number } | null = null;
  function captureCallback(node: AbstractNode, event: AbstractEvent) {
    switch (selector(node)) {
      case SelectorResult.Succuss:
        ret = { node, index: event.index };
      case SelectorResult.Bail:
        event.bail();
    }
  }
  traverseAbstractNodes(captureCallback, node, new AbstractEvent(forward));
  return ret;
}

// function iterateAbstractNode(node: AbstractNode, start: number, forward: boolean) {
// }

interface BoundaryScope {
  boundary1: AbstractNode[];
  boundary2: AbstractNode[];
}

interface PointScope {
  point1: AbstractNode;
  point2: AbstractNode;
}

export interface IntentDetails {
  forward: boolean;
  boundaryScope?: BoundaryScope,
  pointScope?: PointScope,
  configs: AbstractConfigs;
  originEvent?: Event;
}

export class AbstractHelper {
  private _parent: AbstractNode | null = null;

  constructor(
    readonly current: AbstractNode | null,
    private index: number = -1,
  ) {
    const _parent = current?.parent || null;
    assert(index >= -1);
    if (index !== -1) {
      assert(
        _parent &&
        _parent.abstractNodes &&
        index < _parent.abstractNodes.length &&
        this.current === _parent.abstractNodes[index]
      );
      this._parent = _parent;
    }
  }

  private sync() {
    this._parent = this.current?.parent || null;
    const { _parent, index: _index, current } = this;
    if (_parent) {
      assert(current && _parent.abstractNodes);
      if (_parent.abstractNodes[_index] !== current) {
        this.index = _parent.abstractNodes.indexOf(current);
        assert(_index !== -1);
      }
    } else {
      this.index = -1;
    }
  }

  private prepare(strict: boolean, arg0?: AbstractSelector | DocType, ...args: DocType[]) {
    const selector = transformToSelector(arg0, ...args);
    if (strict) {
      this.sync();
    }
    return selector;
  }

  showIntention<T, P>(
    intent: Intent<P>,
    { forward, boundaryScope, pointScope, configs, originEvent }: IntentDetails,
  ): T | undefined {
    const { current } = this;
    if (!current) {
      return undefined;
    }

    const abstractIntent = new AbstractIntent<P, T>(intent, forward);
    function captureCallback(node: AbstractNode, abstractIntent: AbstractIntent) {
      configs[node.type].onIntent(node, abstractIntent);
      if (node.onViewIntent) {
        return node.onViewIntent(abstractIntent, originEvent);
      }
    }

    let arg1;
    let arg2;
    if (boundaryScope) {
      arg1 = boundaryScope.boundary1;
      arg2 = boundaryScope.boundary2;
    } else if (pointScope) {
      arg1 = pointScope.point1;
      arg2 = pointScope.point2;
    }
    traverseAbstractNodes(captureCallback, current, abstractIntent, arg1, arg2);
    return abstractIntent.returnValue;
  }

  assert(): AbstractHelper {
    assert(this.current);
    return this;
  }

  parent(...docTypes: DocType[]): AbstractHelper;
  parent(selector?: AbstractSelector): AbstractHelper;
  parent(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractHelper {
    if (!this.current) {
      return this;
    }
    const selector = this.prepare(true, arg0, ...args);
    let p: AbstractNode | null = this.current.parent;
    let ret = emptyAbstractHelper;
    while (p) {
      if (selector(p)) {
        ret = new AbstractHelper(p);
        break;
      }
      p = p.parent;
    }
    return ret;
  }

  find(...docTypes: DocType[]): AbstractHelper;
  find(selector?: AbstractSelector): AbstractHelper;
  find(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractHelper {
    const selector = this.prepare(false, arg0, ...args);
    const result = this.current && findAbstractNode(this.current, selector, true);
    if (result) {
      return new AbstractHelper(result.node, result.index);
    }
    return emptyAbstractHelper;
  }

  findBackward(...docTypes: DocType[]): AbstractHelper;
  findBackward(selector?: AbstractSelector): AbstractHelper;
  findBackward(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractHelper {
    const selector = this.prepare(false, arg0, ...args);
    const result = this.current && findAbstractNode(this.current, selector, false);
    if (result) {
      return new AbstractHelper(result.node, result.index);
    }
    return emptyAbstractHelper;
  }

  nextSibling(...docTypes: DocType[]): AbstractHelper;
  nextSibling(selector?: AbstractSelector): AbstractHelper;
  nextSibling(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractHelper {
    const { current, _parent } = this;
    if (!current) {
      return this;
    }
    if (_parent) {
      const selector = this.prepare(true, arg0, ...args);
      assert(_parent.abstractNodes);
      for (let i = this.index + 1; i < _parent.abstractNodes.length; i++) {
        const candidate = _parent.abstractNodes[i];
        if (selector(candidate)) {
          return new AbstractHelper(candidate, this.index);
        }
      }
    }
    return emptyAbstractHelper;
  }

  prevSibling(...docTypes: DocType[]): AbstractHelper;
  prevSibling(selector?: AbstractSelector): AbstractHelper;
  prevSibling(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractHelper {
    const { current, _parent } = this;
    if (!current) {
      return this;
    }
    if (_parent) {
      const selector = this.prepare(true, arg0, ...args);
      assert(_parent.abstractNodes);
      for (let i = this.index - 1; i >= 0; i++) {
        const candidate = _parent.abstractNodes[i];
        if (selector(candidate)) {
          return new AbstractHelper(candidate, this.index);
        }
      }
    }
    return emptyAbstractHelper;
  }

  next(...docTypes: DocType[]): AbstractHelper;
  next(selector?: AbstractSelector): AbstractHelper;
  next(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractHelper {
    const { current, _parent } = this;
    if (!current) {
      return this;
    }
    if (_parent) {
      const selector = this.prepare(true, arg0, ...args);
      assert(_parent.abstractNodes);
      for (let i = this.index + 1; i < _parent.abstractNodes.length; i++) {
        const node = _parent.abstractNodes[i];
        const result = findAbstractNode(node, selector, true);
        if (result) {
          return new AbstractHelper(result.node, result.index);
        }
      }
    }
    return emptyAbstractHelper;
  }

  prev(...docTypes: DocType[]): AbstractHelper;
  prev(selector?: AbstractSelector): AbstractHelper;
  prev(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractHelper {
    const { current, _parent } = this;
    if (!current) {
      return this;
    }
    if (_parent) {
      const selector = this.prepare(true, arg0, ...args);
      assert(_parent.abstractNodes);
      for (let i = this.index - 1; i >= 0; i--) {
        const node = _parent.abstractNodes[i];
        const result = findAbstractNode(node, selector, false);
        if (result) {
          return new AbstractHelper(result.node, result.index);
        }
      }
    }
    return emptyAbstractHelper;
  }

  only(): AbstractHelper {
    this.sync();
    const { _parent } = this;
    if (_parent && _parent.abstractNodes && _parent.abstractNodes.length === 1) {
      return this;
    }
    return emptyAbstractHelper;
  }

  assertOnly(): AbstractHelper {
    this.sync();
    const { _parent } = this;
    assert(_parent && _parent.abstractNodes && _parent.abstractNodes.length === 1);
    return this;
  }
}

const emptyAbstractHelper = new AbstractHelper(null);

export function $(abstractNode: AbstractNode | null, index?: number) {
  return new AbstractHelper(abstractNode, index);
}
