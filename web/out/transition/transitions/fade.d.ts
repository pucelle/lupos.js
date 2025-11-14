import { TransitionOptions } from '../transition';
/**
 * When enter, fade opacity from 0 to 1.
 * When leave, fade opacity from 1 to 0.
 * Use Web Animations API, fallback to initial state after transition end.
 */
export declare const fade: (options?: TransitionOptions | undefined) => import("../transition").TransitionResult<Element, TransitionOptions>;
