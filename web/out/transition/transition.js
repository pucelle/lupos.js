import { UpdateQueue, promiseWithResolves } from '@pucelle/lupos';
import { PerFrameTransition } from "./per-frame-transition.js";
import { WebTransition } from "./web-transition.js";
/**
 * Intermediate class generate from instantiating a defined transition.
 * It caches options for later playing.
 */
export class TransitionResult {
    getter;
    options;
    constructor(getter, options = {}) {
        this.getter = getter;
        this.options = options;
    }
}
/**
 * `Transition` can play transition according to a defined transition,
 * with some transition options.
 *
 * `Transition` will dispatch 4 events on target element:
 * - `transition-enter-started`: After enter transition started.
 * - `transition-enter-ended`: After enter transition ended.
 * - `transition-leave-started`: After leave transition started.
 * - `transition-leave-ended`: After leave transition ended.
 * All these event are not able to bubble.
 */
export class Transition {
    /**
     * Define a transition, it accepts a transition getter,
     * which make a transition properties object from target element and some options.
     * And output a function which returns an object to cache this getter and captured options.
     *
     * Note uses `defineTransition` cause executing codes in top level,
     * so you may need to set `sideEffects: false` to make tree shaking work as expected.
     */
    static define(getter) {
        return function (options) {
            return new TransitionResult(getter, options);
        };
    }
    el;
    version = 0;
    result = null;
    mixedTransitions = [];
    /** Whether ready to play transition. */
    ready = null;
    constructor(el) {
        this.el = el;
    }
    /** Whether transition is playing, or will run. */
    get running() {
        return !!this.ready || this.mixedTransitions.some(t => t.transition.running);
    }
    /** Update by new transition result like `fade()`. */
    update(result) {
        this.result = result;
        // Cancel transition immediately if transition value becomes `null`.
        if (!this.result) {
            this.clearTransitions();
        }
    }
    clearTransitions() {
        for (let t of this.mixedTransitions) {
            t.transition.cancel();
        }
        this.mixedTransitions = [];
    }
    /**
     * Play enter transition.
     * e.g., `enter(fade({duration: 1000, easing: 'linear}))`.
     * Returns true if transition finished, false if canceled or prevented.
     * It will wait for update complete then reading dom properties.
     */
    async enter(result) {
        let { phase } = result.options;
        if (phase === 'leave' || phase === 'none') {
            return false;
        }
        if (!await this.prepareTransitions('enter', result)) {
            return false;
        }
        let enterStartedEvent = new CustomEvent('transition-enter-started', { bubbles: false });
        this.el.dispatchEvent(enterStartedEvent);
        let promises = [];
        for (let mixed of this.mixedTransitions) {
            promises.push(this.playMixedTransition(mixed, 'enter'));
        }
        let finished = (await Promise.all(promises)).every(v => v);
        if (finished) {
            let enterEndedEvent = new CustomEvent('transition-enter-ended', { bubbles: false });
            this.el.dispatchEvent(enterEndedEvent);
        }
        return finished;
    }
    /**
     * Play leave transition.
     * e.g., `leave(fade({duration: 1000, easing: 'linear}))`.
     * Returns true if transition finished, false if canceled or prevented.
     * It will wait for update complete then reading dom properties.
     */
    async leave(result) {
        let { phase } = result.options;
        if (phase === 'enter' || phase === 'none') {
            return false;
        }
        if (!await this.prepareTransitions('leave', result)) {
            return false;
        }
        let leaveStartedEvent = new CustomEvent('transition-leave-started', { bubbles: false });
        this.el.dispatchEvent(leaveStartedEvent);
        let promises = [];
        for (let mixed of this.mixedTransitions) {
            promises.push(this.playMixedTransition(mixed, 'leave'));
        }
        let finished = (await Promise.all(promises)).every(v => v);
        if (finished) {
            let leaveEndedEvent = new CustomEvent('transition-leave-ended', { bubbles: false });
            this.el.dispatchEvent(leaveEndedEvent);
        }
        return finished;
    }
    /** Prepare for transition properties, and update mixed transition players. */
    async prepareTransitions(phase, result) {
        let version = ++this.version;
        let { promise, resolve } = promiseWithResolves();
        this.ready = promise.then(() => {
            this.ready = null;
        });
        // Most transition getters will read dom properties.
        // Ensure it firstly render, then play.
        await UpdateQueue.untilAllComplete();
        // May start to play another.
        if (this.version !== version) {
            resolve();
            return false;
        }
        let props = await result.getter(this.el, result.options, phase);
        // All async things completed.
        resolve();
        if (!props) {
            return false;
        }
        if (this.version !== version) {
            return false;
        }
        let propsArray = Array.isArray(props) ? props : [props];
        this.updateMixedTransitions(propsArray);
        return true;
    }
    /** Update for transition players. */
    updateMixedTransitions(propsArray) {
        // Cancel old transitions.
        for (let t of this.mixedTransitions) {
            t.transition.cancel();
        }
        for (let i = 0; i < propsArray.length; i++) {
            let props = propsArray[i];
            let type = this.getTransitionType(props);
            if (this.mixedTransitions.length < i + 1
                || !this.isExistingMixedTransitionMatch(this.mixedTransitions[i], type, props)) {
                let transition;
                // Options exclude null or undefined transition properties.
                let options = cleanEmptyValues({
                    duration: props.duration,
                    easing: props.easing,
                    delay: props.delay,
                });
                if (type === 0 /* MixedTransitionType.PerFrame */) {
                    transition = new PerFrameTransition(options);
                }
                else {
                    let el = props.el ?? this.el;
                    transition = new WebTransition(el, options);
                }
                this.mixedTransitions[i] = { type, transition, props };
            }
        }
        if (this.mixedTransitions.length > propsArray.length) {
            this.mixedTransitions = this.mixedTransitions.slice(0, propsArray.length);
        }
    }
    /** Get transition type by transition properties. */
    getTransitionType(props) {
        if (props.perFrame) {
            return 0 /* MixedTransitionType.PerFrame */;
        }
        else {
            return 1 /* MixedTransitionType.Web */;
        }
    }
    /** Test whether existing mixed transition still match with newly type and props. */
    isExistingMixedTransitionMatch(mixed, type, props) {
        if (type !== mixed.type) {
            return false;
        }
        if (type == 1 /* MixedTransitionType.Web */) {
            let transition = mixed.transition;
            let el = props.el ?? this.el;
            if (transition.el !== el) {
                return false;
            }
        }
        return true;
    }
    /** Play each mixed transition. */
    playMixedTransition(mixed, phase) {
        if (mixed.type === 0 /* MixedTransitionType.PerFrame */) {
            let perFrame = mixed.props.perFrame;
            let transition = mixed.transition;
            if (phase === 'enter') {
                return transition.playBetween(0, 1, perFrame);
            }
            else {
                return transition.playBetween(1, 0, perFrame);
            }
        }
        else {
            let startFrame = mixed.props.startFrame;
            let endFrame = mixed.props.endFrame;
            let transition = mixed.transition;
            if (phase === 'enter') {
                return transition.playBetween(startFrame, endFrame);
            }
            else {
                return transition.playBetween(endFrame, startFrame);
            }
        }
    }
    /**
     * Finish current transition immediately,
     * for per-frame transition, will apply final state,
     * for web transition, will fallback to initial state,
     */
    async finish() {
        if (this.ready) {
            await this.ready;
        }
        for (let { transition } of this.mixedTransitions) {
            transition.finish();
        }
    }
    /**
     * Cancel current transition if is playing.
     * Note after cancelled,
     * for per-frame transition, will persist current state,
     * for web transition, will fallback to initial state,
     * Both of them will not apply final state.
     */
    cancel() {
        for (let { transition } of this.mixedTransitions) {
            transition.cancel();
        }
        this.version++;
    }
}
/** Clear all keys which relevant values are `null` or `undefined`. */
function cleanEmptyValues(o) {
    for (let key of Object.keys(o)) {
        if (o[key] === null || o[key] === undefined) {
            delete o[key];
        }
    }
    return o;
}
