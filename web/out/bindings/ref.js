import { Component } from "../component/index.js";
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
export class RefBinding {
    el;
    context;
    /** Whether reference element, or component, or binding. */
    refType = 0 /* RefType.Element */;
    /** Compiler will compile `this.prop` -> `r => this.prop = r` */
    refFn = null;
    /** Whether has been referenced. */
    refed = false;
    constructor(el, context, modifiers = []) {
        this.el = el;
        this.context = context;
        this.refType = modifiers.includes('el')
            ? 0 /* RefType.Element */
            : modifiers.includes('com')
                ? 1 /* RefType.Component */
                : modifiers.includes('binding')
                    ? 2 /* RefType.Binding */
                    : 0 /* RefType.Element */;
    }
    update(refFn) {
        this.refFn = refFn;
    }
    doReference() {
        if (this.refType === 0 /* RefType.Element */) {
            this.refFn.call(this.context, this.el);
        }
        else if (this.refType === 1 /* RefType.Component */) {
            let com = Component.from(this.el);
            this.refFn.call(this.context, com);
        }
        else {
            this.refFn.call(this.context, true);
        }
        this.refed = true;
    }
    afterConnectCallback(_param) {
        if (this.refFn && !this.refed) {
            this.doReference();
        }
    }
    beforeDisconnectCallback(param) {
        if ((param & 1 /* PartCallbackParameterMask.FromOwnStateChange */) === 0) {
            return;
        }
        if (this.refFn) {
            this.refFn.call(this.context, this.refType === 2 /* RefType.Binding */ ? false : null);
            this.refed = false;
        }
    }
}
