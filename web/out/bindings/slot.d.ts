import { Part, PartCallbackParameterMask } from '../part';
import { Binding } from './types';
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
export declare class SlotBinding implements Binding, Part {
    private readonly el;
    private slotName;
    private com;
    constructor(el: Element);
    update(slotName: string): void;
    afterConnectCallback(_param: PartCallbackParameterMask | 0): void;
    beforeDisconnectCallback(param: PartCallbackParameterMask | 0): void;
}
