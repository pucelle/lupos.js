import { PerFrameTransitionOptions } from './per-frame-transition';
import { WebTransitionKeyFrame } from './web-transition';
/**
 * Base transition options for `Transition`.
 * Note some easing name like `ease-in-elastic` is not available for web type transition.
 */
export interface TransitionOptions extends PerFrameTransitionOptions {
    /**
     * Specifies transition phase.
     * E.g., if specifies to `enter` and need to play leave transition, nothing happens.
     * Default value is `both`.
     */
    phase?: TransitionPhase;
}
/**
 * Transition phase limit, includes enter and leave part.
 * Only phase is allowed the transition can play.
 */
export type TransitionPhase = 'enter' | 'leave' | 'both' | 'none';
export interface WebTransitionProperties extends PerFrameTransitionOptions {
    /**
     * Specifies the element to play transition.
     * If omit, use current element.
     */
    el?: Element;
    /**
     * Start frame, specifies the start state of enter or end state of leave.
     * It's normally a "zero" state.
     */
    startFrame: WebTransitionKeyFrame;
    /**
     * End frame, specifies the end state of enter or start state of leave.
     * It's normally a "100%" state.
     */
    endFrame: WebTransitionKeyFrame;
}
export interface PerFrameTransitionProperties extends PerFrameTransitionOptions {
    /**
     * Process somethings per frame.
     * `progress` betweens `0~1`.
     */
    perFrame: (progress: number) => void;
}
/**
 * Transition properties to decide how to run the transition,
 * A defined transition getter should return this.
 * It's decided by target element and options for this transition getter.
 */
export type TransitionProperties = WebTransitionProperties | PerFrameTransitionProperties | WebTransitionProperties[];
/**
 * A transition getter,
 * it accepts target element and options for this transition getter,
 * and return transition properties.
 *
 * Can either return a transition properties, null, or a promise resolved by these.
 *
 * Normally you should choose returning `startFrame` and `endFrame` to use web transition.
 */
export type TransitionPropertiesGetter<E extends Element, O extends TransitionOptions | undefined> = (el: E, options: O, phase: 'enter' | 'leave') => TransitionProperties | null | Promise<TransitionProperties | null>;
/**
 * Calls `Transition.define` returned.
 * Give it to a `new Transition` can play it.
 */
export type DefinedTransition<E extends Element = Element, O extends TransitionOptions = TransitionOptions> = (options?: O) => TransitionResult<E, O>;
/**
 * Intermediate class generate from instantiating a defined transition.
 * It caches options for later playing.
 */
export declare class TransitionResult<E extends Element = Element, O extends TransitionOptions = any> {
    readonly getter: TransitionPropertiesGetter<E, O>;
    readonly options: O;
    constructor(getter: TransitionPropertiesGetter<E, O>, options?: O);
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
export declare class Transition {
    /**
     * Define a transition, it accepts a transition getter,
     * which make a transition properties object from target element and some options.
     * And output a function which returns an object to cache this getter and captured options.
     *
     * Note uses `defineTransition` cause executing codes in top level,
     * so you may need to set `sideEffects: false` to make tree shaking work as expected.
     */
    static define<E extends Element, O extends TransitionOptions>(getter: TransitionPropertiesGetter<E, O>): (options?: O) => TransitionResult<E, O>;
    private readonly el;
    private version;
    private result;
    private mixedTransitions;
    /** Whether ready to play transition. */
    private ready;
    constructor(el: Element);
    /** Whether transition is playing, or will run. */
    get running(): boolean;
    /** Update by new transition result like `fade()`. */
    update(result: TransitionResult | null): void;
    private clearTransitions;
    /**
     * Play enter transition.
     * e.g., `enter(fade({duration: 1000, easing: 'linear}))`.
     * Returns true if transition finished, false if canceled or prevented.
     * It will wait for update complete then reading dom properties.
     */
    enter(result: TransitionResult): Promise<boolean>;
    /**
     * Play leave transition.
     * e.g., `leave(fade({duration: 1000, easing: 'linear}))`.
     * Returns true if transition finished, false if canceled or prevented.
     * It will wait for update complete then reading dom properties.
     */
    leave(result: TransitionResult): Promise<boolean>;
    /** Prepare for transition properties, and update mixed transition players. */
    private prepareTransitions;
    /** Update for transition players. */
    private updateMixedTransitions;
    /** Get transition type by transition properties. */
    private getTransitionType;
    /** Test whether existing mixed transition still match with newly type and props. */
    private isExistingMixedTransitionMatch;
    /** Play each mixed transition. */
    private playMixedTransition;
    /**
     * Finish current transition immediately,
     * for per-frame transition, will apply final state,
     * for web transition, will fallback to initial state,
     */
    finish(): Promise<void>;
    /**
     * Cancel current transition if is playing.
     * Note after cancelled,
     * for per-frame transition, will persist current state,
     * for web transition, will fallback to initial state,
     * Both of them will not apply final state.
     */
    cancel(): void;
}
