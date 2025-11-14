import { TransitionOptions } from '../transition';
export interface BlurTransitionOptions extends TransitionOptions {
    /**
     * CSS filter blur radius, can be number, or css value with unit.
     * Default value is `5`.
     */
    radius: number | string;
    /**
     * If want element is also fade out when leave, or fade in when enter
     * specifies this value to `true`.
     * Default value is `false`.
     */
    fade?: boolean;
}
/**
 * When enter, do blur filter from with radius from specified value to 0.
 * When leave, do blur filter from with radius from 0 to specified value.
 * Use Web Animations API, fallback to initial state after transition end.
 */
export declare const blur: (options?: BlurTransitionOptions | undefined) => import("../transition").TransitionResult<Element, BlurTransitionOptions>;
