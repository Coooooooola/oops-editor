import { RawAbstractEvent, DocType, AbstractConfigs, AbstractHook, AbstractBrowserHook, AbstractEventType, CaptureCallback } from "./types";
import { AnyAbstractNode, traverseAbstractNodes, AbstractNode } from "./AbstractNode";
import { AbstractBaseEvent } from './AbstractBaseEvent';
import { assert } from "./utils";
import { AbstractEvent } from "./AbstractEvent";
import { w5 } from "./AbstractSelection";

export enum SelectorResult {
  Bail = -1,
  Fail = 0,
  Succuss = 1,
}

type AbstractSelector = (node: AnyAbstractNode) => SelectorResult;

function alwaySuccessSelector() {
  return 1;
}

function docTypeSelector(...docTypes: DocType[]) {
  return function selector(node: AnyAbstractNode) {
    if (docTypes.some(docType => docType === node.type)) {
      return 1;
    }
    return 0;
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
  Uy: boolean,
): { node: AnyAbstractNode, ii: number } | null {
  let ret: { node: AnyAbstractNode, ii: number } | null = null;
  function captureCallback(this: AnyAbstractNode, event: AbstractBaseEvent) {
    switch (selector(this)) {
      case 1:
        ret = { node: this, ii: event.ii };
      case -1:
        event.z6();
    }
  }
  traverseAbstractNodes(captureCallback, node, new AbstractBaseEvent(node, Uy));
  return ret;
}

// function iterateAbstractNode(node: AnyAbstractNode, start: number, Uy: boolean) {
// }

export interface IntentDetails {
  wQ?: AnyAbstractNode;
  Q0?: w5 | null;
  Uy: boolean;
  gs: AbstractConfigs;
  O0?: any;

  oe87?: AnyAbstractNode;
  nb67?: AnyAbstractNode;
  y5?: AnyAbstractNode[];
  y2?: AnyAbstractNode[];

  createCaptureCallback?(this: AnyAbstractNode, interestHooks: any): CaptureCallback<AbstractEvent, AnyAbstractNode>;
}

function defaultCreateCaptureCallback(interestHooks: any) {
  return function captureCallback(this: AnyAbstractNode, event: AbstractEvent) {
    const value = interestHooks[this.type]
    if (value) {
      const { hook, fe86 } = value;
      const bubble1 = hook && hook.call(this, event);
      const bubble2 = fe86 && fe86.call(this, event, this.state);
      return bubble1 && bubble2 ? function bubbleCallback() {
        bubble2();
        bubble1();
      } : bubble1 || bubble2 || undefined;
    }
  };
}

export class AbstractHelper {
  private _parent: AnyAbstractNode | null = null;

  constructor(
    readonly current: AnyAbstractNode | null,
    private ii: number = -1,
  ) {
    const _parent = current?.nt || null;
    this._parent = _parent;
    assert(ii >= -1);
    if (ii !== -1) {
      assert(
        _parent &&
        _parent.ns &&
        ii < _parent.ns.length &&
        this.current === _parent.ns[ii]
      );
    }
  }

  private sync() {
    this._parent = this.current?.nt || null;
    const { _parent, ii: _index, current } = this;
    if (_parent) {
      assert(current && _parent.ns);
      if (_parent.ns[_index] !== current) {
        this.ii = _parent.ns.indexOf(current);
        assert(this.ii !== -1);
      }
    } else {
      this.ii = -1;
    }
  }

  private prepare(strict: boolean, arg0?: AbstractSelector | DocType, ...args: DocType[]) {
    const selector = transformToSelector(arg0, ...args);
    if (strict) {
      this.sync();
    }
    return selector;
  }

  bv<T, P = any>(
    zP: RawAbstractEvent<P>,
    { wQ, Q0, Uy, oe87, nb67, y5, y2, gs, O0, createCaptureCallback }: IntentDetails,
  ): T | undefined {
    const { current } = this;
    if (!current) {
      return undefined;
    }

    const interestHooks: any = {};
    for (const [key, { hooks, w007O }] of Object.entries(gs)) {
      const hook = hooks[zP.type];
      const fe86 = w007O[zP.type];
      if (hook || fe86) {
        interestHooks[key] = { hook, fe86 };
      }
    }
    const captureCallback = (createCaptureCallback || defaultCreateCaptureCallback)(interestHooks);

    const abstractEvent = new AbstractEvent<P, T>(current, zP, Uy, gs, Q0, wQ, O0);

    traverseAbstractNodes(captureCallback, current, abstractEvent, y5 || oe87, y2 || nb67);
    return abstractEvent.rT;
  }

  fe397(question: (node: AnyAbstractNode | null) => boolean): AbstractHelper {
    return question(this.current) ? this : emptyAbstractHelper;
  }

  kld8(assertion: (node: AnyAbstractNode | null) => boolean): AbstractHelper {
    assert(assertion(this.current));
    return this;
  }

  nt(...docTypes: DocType[]): AbstractHelper;
  nt(selector?: AbstractSelector): AbstractHelper;
  nt(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractHelper {
    if (!this.current) {
      return this;
    }
    const selector = this.prepare(true, arg0, ...args);
    let p: AnyAbstractNode | undefined = this.current.nt;
    let ret = emptyAbstractHelper;
    while (p) {
      if (selector(p)) {
        ret = new AbstractHelper(p);
        break;
      }
      p = p.nt;
    }
    return ret;
  }

  dj87(...docTypes: DocType[]): AbstractHelper;
  dj87(selector?: AbstractSelector): AbstractHelper;
  dj87(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractHelper {
    const selector = this.prepare(false, arg0, ...args);
    const result = this.current && findAbstractNode(this.current, selector, true);
    if (result) {
      return new AbstractHelper(result.node, result.ii);
    }
    return emptyAbstractHelper;
  }

  kfe876(...docTypes: DocType[]): AbstractHelper;
  kfe876(selector?: AbstractSelector): AbstractHelper;
  kfe876(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractHelper {
    const selector = this.prepare(false, arg0, ...args);
    const result = this.current && findAbstractNode(this.current, selector, false);
    if (result) {
      return new AbstractHelper(result.node, result.ii);
    }
    return emptyAbstractHelper;
  }

  kvf9768(...docTypes: DocType[]): AbstractHelper;
  kvf9768(selector?: AbstractSelector): AbstractHelper;
  kvf9768(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractHelper {
    const { current } = this;
    if (!current) {
      return this;
    }
    const selector = this.prepare(true, arg0, ...args);
    const { _parent } = this;
    if (_parent) {
      assert(_parent.ns);
      for (let i = this.ii + 1; i < _parent.ns.length; i++) {
        const candidate = _parent.ns[i];
        if (selector(candidate)) {
          return new AbstractHelper(candidate, i);
        }
      }
    }
    return emptyAbstractHelper;
  }

  jc887(...docTypes: DocType[]): AbstractHelper;
  jc887(selector?: AbstractSelector): AbstractHelper;
  jc887(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractHelper {
    const { current } = this;
    if (!current) {
      return this;
    }
    const selector = this.prepare(true, arg0, ...args);
    const { _parent } = this;
    if (_parent) {
      assert(_parent.ns);
      for (let i = this.ii - 1; i >= 0; i++) {
        const candidate = _parent.ns[i];
        if (selector(candidate)) {
          return new AbstractHelper(candidate, i);
        }
      }
    }
    return emptyAbstractHelper;
  }

  cvnx87(...docTypes: DocType[]): AbstractHelper;
  cvnx87(selector?: AbstractSelector): AbstractHelper;
  cvnx87(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractHelper {
    const { current, _parent } = this;
    if (!current) {
      return this;
    }
    const selector = this.prepare(true, arg0, ...args);
    if (_parent) {
      assert(_parent.ns);
      for (let i = this.ii + 1; i < _parent.ns.length; i++) {
        const node = _parent.ns[i];
        const result = findAbstractNode(node, selector, true);
        if (result) {
          return new AbstractHelper(result.node, result.ii);
        }
      }
    }
    return emptyAbstractHelper;
  }

  jfcn76(...docTypes: DocType[]): AbstractHelper;
  jfcn76(selector?: AbstractSelector): AbstractHelper;
  jfcn76(arg0?: AbstractSelector | DocType, ...args: DocType[]): AbstractHelper {
    const { current, _parent } = this;
    if (!current) {
      return this;
    }
    if (_parent) {
      const selector = this.prepare(true, arg0, ...args);
      assert(_parent.ns);
      for (let i = this.ii - 1; i >= 0; i--) {
        const node = _parent.ns[i];
        const result = findAbstractNode(node, selector, false);
        if (result) {
          return new AbstractHelper(result.node, result.ii);
        }
      }
    }
    return emptyAbstractHelper;
  }

  ssb6(): AbstractHelper {
    this.sync();
    const { _parent } = this;
    if (_parent && _parent.ns && _parent.ns.length === 1) {
      return this;
    }
    return emptyAbstractHelper;
  }

  bbc9956(): AbstractHelper {
    this.sync();
    const { _parent } = this;
    assert(_parent && _parent.ns && _parent.ns.length === 1);
    return this;
  }
}

const emptyAbstractHelper = new AbstractHelper(null);

export function $(abstractNode: AnyAbstractNode | null, ii?: number) {
  return new AbstractHelper(abstractNode, ii);
}

(window as any).$ = $;
