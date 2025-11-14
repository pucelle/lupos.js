import { Component } from '../component';
import { Part, PartCallbackParameterMask } from '../part';
import { Binding } from './types';
/**
 * To reference target component or element as a property of current component.
 * - `<el :ref=${this.prop}>`- Reference target element as a property of current component.
 * - `<Com :ref=${this.prop}>`- Reference target component as a property of current component.
 * - `<Com :ref.el=${this.prop}>`- Reference element of target component as a property of current component.
 * - `<XXX :ref.binding=${this.prop}>`- Reference previous binding `:binding=...`.
 * - `<XXX :ref=${function(comOrElOrBinding){...}}>`- Reference target element by a ref function, `this` is current context.
 *
 * Note `:ref` doesn't support conditional binding: `?:ref`.
 *
 * Note `:ref` can't visit or bind scoped data. e.g.: following examples will not work:
 * - `<div :ref=${(el) => this.refElWithData(el, localVariable)}>`
 * - `<div :ref=${(el) => if (localVariable) this.refElWithData(el)}>`
 */
export declare class RefBinding implements Binding, Part {
    private readonly el;
    private readonly context;
    /** Whether reference element, or component, or binding. */
    private refType;
    /** Compiler will compile `this.prop` -> `r => this.prop = r` */
    private refFn;
    /** Whether has been referenced. */
    private refed;
    constructor(el: Element, context: any, modifiers?: ('el' | 'com' | 'binding')[]);
    update(refFn: (value: Component | Element | Binding | null) => void): void;
    private doReference;
    afterConnectCallback(_param: PartCallbackParameterMask | 0): void;
    beforeDisconnectCallback(param: PartCallbackParameterMask | 0): void;
}
