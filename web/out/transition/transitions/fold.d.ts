import { TransitionOptions } from '../transition';
export interface FoldTransitionOptions extends TransitionOptions {
    /**
     * Fold on vertical or horizontal direction.
     * Default value is `vertical`
     */
    direction?: 'vertical' | 'horizontal';
    /**
     * If want element is also fade out when leave, or fade in when enter,
     * specifies this value to `true`.
     * Default value is `false`.
     */
    fade?: boolean;
}
/**
 * When enter, fold from height or width 0 to natural height or width.
 * When leave, fold from natural height or width to 0.
 * Note you should normally set `overflow: hidden` to avoid content overflow.
 * Uses Web Animations API, fallback to initial state after transition end.
 */
export declare const fold: (options?: FoldTransitionOptions | undefined) => import("../transition").TransitionResult<HTMLElement, FoldTransitionOptions>;
