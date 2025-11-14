/** Easing function. inputs `0~1`, outputs `0~1` normally. */
export type EasingFunction = (x: number) => number;
/** Web Animation easing names, for web animation and transition. */
export type WebTransitionEasingName = keyof typeof CubicBezierEasingParameters | 'linear';
/** Per frame easing names, for per-frame animation and transition. */
export type PerFrameTransitionEasingName = keyof typeof CubicBezierEasingParameters | keyof typeof CustomEasingFunctions;
/**
 * Specifies easing name and their bezier parameters,
 * Comes from `Bourbon` source codes.
 * Can also reference to `https://easings.net/`.
 */
declare const CubicBezierEasingParameters: {
    ease: number[];
    'ease-in': number[];
    'ease-out': number[];
    'ease-in-out': number[];
    'ease-in-quad': number[];
    'ease-in-cubic': number[];
    'ease-in-quart': number[];
    'ease-in-quint': number[];
    'ease-in-sine': number[];
    'ease-in-expo': number[];
    'ease-in-circle': number[];
    'ease-in-back': number[];
    'ease-out-quad': number[];
    'ease-out-cubic': number[];
    'ease-out-quart': number[];
    'ease-out-quint': number[];
    'ease-out-sine': number[];
    'ease-out-expo': number[];
    'ease-out-circle': number[];
    'ease-out-back': number[];
    'ease-in-out-quad': number[];
    'ease-in-out-cubic': number[];
    'ease-in-out-quart': number[];
    'ease-in-out-quint': number[];
    'ease-in-out-sine': number[];
    'ease-in-out-expo': number[];
    'ease-in-out-circle': number[];
    'ease-in-out-back': number[];
};
/** Customized easing functions. */
declare const CustomEasingFunctions: {
    linear(x: number): number;
    'ease-in-elastic'(x: number): number;
    'ease-out-elastic'(x: number): number;
    'ease-in-out-elastic'(x: number): number;
    'ease-in-bounce'(x: number): number;
    'ease-out-bounce': typeof bounceOut;
    'ease-in-out-bounce'(x: number): number;
};
/** From `https://easings.net/`. */
declare function bounceOut(x: number): number;
/**
 * Get a `(x) => y` easing function by easing name,
 * Used to mapped time percentage to it's value percentage.
 */
export declare function getEasingFunction(name: PerFrameTransitionEasingName): EasingFunction;
/** Get `cubic-bezier(...)` or `linear` as CSS easing name. */
export declare function getCSSEasingValue(easing: WebTransitionEasingName): string;
export {};
