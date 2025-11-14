import { PerFrameTransitionEasingName } from './easing';
type HVDirection = 'horizontal' | 'vertical';
/**
 * Scroll scrollbar in specified direction of closest scroll wrapper,
 * for minimal distance to make element to become fully visible.
 * @param scrollDirection `horizontal` | `vertical` | `null`, if is null, will detect scroll direction.
 * @param gap Reserve a little distance from the element's edge away from scroll viewport edge, default value is `0`.
 * @param duration Transition duration, default value is `0`.
 * @param easing Transition easing, default value is `0`.
 *
 * Returns a promise which will be resolved by whether scrolled.
 */
export declare function scrollToView(el: HTMLElement, scrollDirection?: HVDirection | null, gap?: number, duration?: number, easing?: PerFrameTransitionEasingName): Promise<boolean>;
/**
 * Scroll closest scrollbar to make element in the top most or left most of the scroll viewport.
 * @param scrollDirection `horizontal` | `vertical` | `null`, if is null, will detect scroll direction.
 * @param gap Reserve a little distance from the element's edge away from scroll viewport edge, default value is `0`.
 * @param duration Transition duration, default value is `0`.
 * @param easing Transition easing, default value is `0`.

 * Returns a promise which will be resolved by whether scrolled.
 */
export declare function scrollToStart(el: HTMLElement, scrollDirection?: HVDirection | null, gap?: number, duration?: number, easing?: PerFrameTransitionEasingName): Promise<boolean>;
/**
 * Scroll closest scrollbar to make element in the top most of the scroll viewport.
 * @param gap Reserve a little distance from the element's edge away from scroll viewport edge, default value is `0`.
 * @param duration Transition duration, default value is `0`.
 * @param easing Transition easing, default value is `0`.
 *
 * Returns a promise which will be resolved by whether scrolled.
 */
export declare function scrollToTop(el: HTMLElement, gap?: number, duration?: number, easing?: PerFrameTransitionEasingName): Promise<boolean>;
/**
 * Scroll closest scrollbar to make element in the left most of the scroll viewport.
 * @param gap Reserve a little distance from the element's edge away from scroll viewport edge, default value is `0`.
 * @param duration Transition duration, default value is `0`.
 * @param easing Transition easing, default value is `0`.
 *
 * Returns a promise which will be resolved by whether scrolled.
 */
export declare function scrollToLeft(el: HTMLElement, gap?: number, duration?: number, easing?: PerFrameTransitionEasingName): Promise<boolean>;
export {};
