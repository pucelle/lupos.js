import { Transition } from "../transition/index.js";
/** Cache those bindings that haven't trigger connect callback yet. */
const NotConnectCallbackForFirstTime = /*#__PURE__*/ new WeakSet();
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
export class TransitionBinding {
    el;
    /**
     * A `local` transition as default action,
     * can only play when attached elements been directly inserted or removed.
     * A `global` transition can play when any level of ancestral element get inserted or removed.
     */
    global = false;
    /**
     * By default, transition cant play when get initialized.
     * But set `immediate` can make it play.
     */
    immediate = false;
    result = null;
    transition;
    constructor(el, _context, modifiers = []) {
        this.el = el;
        this.global = modifiers.includes('global');
        this.immediate = modifiers.includes('immediate');
        this.transition = new Transition(this.el);
        NotConnectCallbackForFirstTime.add(this);
    }
    afterConnectCallback(param) {
        // Connect immediately manually, no need to play transition.
        if (param & 8 /* PartCallbackParameterMask.MoveImmediately */) {
            return;
        }
        if (NotConnectCallbackForFirstTime.has(this)) {
            NotConnectCallbackForFirstTime.delete(this);
            // Prevent first time enter transition playing if not `immediate`.
            if (!this.immediate) {
                return;
            }
        }
        if (this.global || (param & 2 /* PartCallbackParameterMask.AsDirectNode */) > 0) {
            this.enter();
        }
    }
    beforeDisconnectCallback(param) {
        this.cancel();
        // Ancestral element has been removed immediately, no need to play transition.
        if (param & 8 /* PartCallbackParameterMask.MoveImmediately */) {
            return;
        }
        if (this.global || (param & 2 /* PartCallbackParameterMask.AsDirectNode */) > 0) {
            return this.leave();
        }
    }
    update(result) {
        this.result = result;
        // Cancel transition immediately if transition value becomes `null`.
        if (!this.result) {
            this.transition.cancel();
        }
    }
    /** Cancel playing transition. */
    cancel() {
        return this.transition.cancel();
    }
    /** Called after the attached element is connected into document. */
    enter() {
        let result = this.getResult();
        if (!result) {
            return;
        }
        return this.transition.enter(result);
    }
    getResult() {
        if (typeof this.result === 'function') {
            return this.result();
        }
        return this.result;
    }
    /** Called before the attached element begin to disconnect from document. */
    leave() {
        let result = this.getResult();
        if (!result) {
            return;
        }
        return this.transition.leave(result);
    }
}
