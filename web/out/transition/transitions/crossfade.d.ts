import { TransitionOptions, TransitionResult } from '../transition';
export interface CrossFadeTransitionOptions extends TransitionOptions {
    /** The key to match a pair of elements. */
    key: any;
    /** If specified, select this element and use it's rect to do transition. */
    rectSelector?: string;
    /**
     * How to fit transition element with it's pair element.
     *  - `contain`: be contained by pair element.
     *  - `cover`: covers pair element.
     *  - `stretch`: stretch to fit pair element's width and height.
     * Default value is `stretch`.
     */
    fitMode?: 'contain' | 'cover' | 'stretch';
    /** Whether also play fade transition. */
    fade?: boolean;
    /**
     * Define the fallback transition when no matched element.
     * E.g., `{fallback: fade()}`.
     * By default no fallback defined, no transition will be played.
     */
    fallback?: TransitionResult;
}
/**
 * Set element for crossfade transition.
 * It will provide the mapped element rect for later connected `crossfade` transition,
 * but itself will not play transition.
 */
export declare function setCrossFadeElementForPairOnly(key: any, el: Element): void;
/** Delete element previously set by `setCrossFadeElementForPairOnly` for crossfade transition. */
export declare function deleteCrossFadeElementForPairOnly(key: any, el: Element): void;
/** Get element for crossfade transition pair. */
export declare function getCrossFadeElementForPhase(key: any, phase: 'enter' | 'leave' | 'any'): Element | undefined;
/**
 * When enter, transform from the leave element to current state.
 * When leave, transform from current state to the leave element.
 * So you can see one element cross fade to another element.
 * Use Web Animations API, fallback to initial state after transition end.
 */
export declare const crossfade: (options?: CrossFadeTransitionOptions | undefined) => TransitionResult<Element, CrossFadeTransitionOptions>;
