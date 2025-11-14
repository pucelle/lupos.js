import { Component } from "../component/index.js";
/**
 * `:slot` binds current element as one of `slotElements` sub property,
 * and later insert it into same named `<slot>` of closest component.
 * - `<el :slot="slotName">`
 *
 * Note: compiler may replace this binding to equivalent codes.
 *
 * Passing a html`...` as parameter would do same
 * thing like a slot interpolation do,
 * but if you want to toggle dynamic component,
 * and don't want re-render embedded content,
 * Use slot interpolation would be better.
 *
 * Otherwise, you may also pre-render a node,
 * or a component-like by `render(...)` and pass it's `el`
 * as `${referencedNode}` to template to re-use it.
 */
export class SlotBinding {
    el;
    slotName = null;
    com = null;
    constructor(el) {
        this.el = el;
    }
    update(slotName) {
        this.slotName = slotName;
    }
    afterConnectCallback(_param) {
        let com = Component.fromClosest(this.el.parentElement);
        if (com) {
            this.com = com;
            com.$setSlotElement(this.slotName, this.el);
        }
    }
    beforeDisconnectCallback(param) {
        if ((param & 1 /* PartCallbackParameterMask.FromOwnStateChange */) === 0) {
            return;
        }
        if (this.com) {
            this.com.$setSlotElement(this.slotName, null);
            this.com = null;
        }
    }
}
