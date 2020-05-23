import { RawAbstractEvent, DocType, AbstractConfigs, AbstractHook, AbstractBrowserHook } from "./types";
import { AnyAbstractNode, traverseAbstractNodes, AbstractNode } from "./AbstractNode";
import { AbstractBaseEvent } from './AbstractBaseEvent';
import { assert } from "./utils";
import { AbstractEvent } from "./AbstractEvent";
import { AbstractRange } from "./AbstractSelection";

export enum SelectorResult {
  Bail = -1,
  Fail = 0,
  Succuss = 1,
}

type AbstractSelector = (node: AnyAbstractNode) => SelectorResult;

function alwaySuccessSelector() {
  return SelectorResult.Succuss;
}

function docTypeSelector(...docTypes: DocType[]) {
  return function selector(node: AnyAbstractNode) {
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
  node: AnyAbstractNode,
  selector: AbstractSelector,
  forward: boolean,
): { node: AnyAbstractNode, index: number } | null {
  let ret: { node: AnyAbstractNode, index: number } | null = null;
  function captureCallback(node: AnyAbstractNode, event: AbstractBaseEvent) {
    switch (selector(node)) {
      case SelectorResult.Succuss:
        ret = { node, index: event.index };
      case SelectorResult.Bail:
        event.bail();
    }
  }
  traverseAbstractNodes(captureCallback, node, new AbstractBaseEvent(node, forward));
  return ret;
}

// function iterateAbstractNode(node: AnyAbstractNode, start: number, forward: boolean) {
// }

export interface IntentDetails {
  initiator?: AnyAbstractNode;
  range?: AbstractRange | null;
  forward: boolean;
  configs: AbstractConfigs;
  originEvent?: any;

  point1?: AnyAbstractNode;
  point2?: AnyAbstractNode;
  boundary1?: AnyAbstractNode[];
  boundary2?: AnyAbstractNode[];
}

export class AbstractHelper {
  private _parent: AnyAbstractNode | null = null;

  constructor(
    readonly current: AnyAbstractNode | null,
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

  dispatchEvent<T, P = any>(
    rawEvent: RawAbstractEvent<P>,
    { initiator, range, forward, point1, point2, boundary1, boundary2, configs, originEvent }: IntentDetails,
  ): T | undefined {
    const { current } = this;
    if (!current) {
      return undefined;
    }

    const interestHooks: any = {};
    for (const [key, value] of Object.entries(configs)) {
      const hook = value.hooks[rawEvent.type];
      const browserHooks = value.browserHooks[rawEvent.type];
      if (hook || browserHooks) {
        interestHooks[key] = { hook, browserHooks };
      }
    }

    const abstractEvent = new AbstractEvent<P, T>(current, rawEvent, forward, configs, range, initiator, originEvent);
    function captureCallback(node: AnyAbstractNode) {
      const value = interestHooks[node.type]
      if (value) {
        const { hook, browserHooks } = value;
        const bubble1 = hook && hook.call(node, abstractEvent);
        const bubble2 = browserHooks && browserHooks.call(node, abstractEvent, node.viewData);
        return bubble1 && bubble2 ? function bubbleCallback() {
          bubble2();
          bubble1();
        } : bubble1 || bubble2 || undefined;
      }
    }

    traverseAbstractNodes(captureCallback, current, abstractEvent, boundary1 || point1, boundary2 || point2);
    return abstractEvent.returnValue;
  }

  is(question: (node: AnyAbstractNode | null) => boolean): AbstractHelper {
    return question(this.current) ? this : emptyAbstractHelper;
  }

  assert(assertion: (node: AnyAbstractNode | null) => boolean): AbstractHelper {
    assert(assertion(this.current));
    return this;
  }

  parent(...docTypes: DocType[]): AbstractHelper;
  parent(selector?: AbstractSelector): AbstractHelper;
  parent(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractHelper {
    if (!this.current) {
      return this;
    }
    const selector = this.prepare(true, arg0, ...args);
    let p: AnyAbstractNode | undefined = this.current.parent;
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

export function $(abstractNode: AnyAbstractNode | null, index?: number) {
  return new AbstractHelper(abstractNode, index);
}

(window as any).$ = $;
