import { TransitionResult } from '../transition';
import { Binding } from './types';
import { Part, PartCallbackParameterMask } from '../part';
/**
 * `:transition` binding can play transition after element connected or before element disconnect.
 * - `<el :transition=${fade({duration, ...})}>`
 * - `<el :transition.local=${...}>`: play transition only when element itself get inserted or removed. `.local` can omit.
 * - `<el :transition.global=${...}>`: play transition when element or any ancestral element get inserted or removed.
 * - `<el :transition.immediate=${...}>`: play transition immediately after element get initialized.
 * - `<el :transition=${() => {...}}>`: Get transition result by a function, useful for leave transition to update transition parameters.
 *
 * `:transition` binding will dispatch 4 events on the target element:
 * - `transition-enter-started`: After enter transition started.
 * - `transition-enter-ended`: After enter transition ended.
 * - `transition-leave-started`: After leave transition started.
 * - `transition-leave-ended`: After leave transition ended.
 */
export declare class TransitionBinding implements Binding, Part {
    private readonly el;
    /**
     * A `local` transition as default action,
     * can only play when attached elements been directly inserted or removed.
     * A `global` transition can play when any level of ancestral element get inserted or removed.
     */
    private global;
    /**
     * By default, transition cant play when get initialized.
     * But set `immediate` can make it play.
     */
    private immediate;
    private result;
    private transition;
    constructor(el: Element, _context: any, modifiers?: ('global' | 'local' | 'immediate')[]);
    afterConnectCallback(param: PartCallbackParameterMask | 0): void;
    beforeDisconnectCallback(param: PartCallbackParameterMask | 0): Promise<void> | void;
    update(result: TransitionResult | null | (() => TransitionResult | null)): void;
    /** Cancel playing transition. */
    cancel(): void;
    /** Called after the attached element is connected into document. */
    enter(): Promise<boolean | null> | void;
    private getResult;
    /** Called before the attached element begin to disconnect from document. */
    leave(): Promise<boolean | null> | void;
}
