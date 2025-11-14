import { TransitionOptions } from '../transition';
export interface FlyTransitionOptions extends TransitionOptions {
    /**
     * The x value specifies the translated in x axis before enter or after leave.
     * Can be number, or css value with unit.
     * Default value is `0`.
     */
    x?: number | string;
    /**
     * The y value specifies the translated in y axis before enter or after leave.
     * Can be number, or css value with unit.
     * Default value is `0`.
     */
    y?: number | string;
    /**
     * If want element is also fade out when leave, or fade in when enter,
     * specifies this value to `true`.
     * Default value is `false`.
     */
    fade?: boolean;
}
/**
 * When enter, translate and fade from specified values to none.
 * When leave, translate and fade from none to specified values.
 *
 * Use Web Animations API, fallback to initial state after transition end.
 */
export declare const fly: (options?: FlyTransitionOptions | undefined) => import("../transition").TransitionResult<Element, FlyTransitionOptions>;
