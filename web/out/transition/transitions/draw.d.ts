import { TransitionOptions } from '../transition';
export interface DrawTransitionOptions extends TransitionOptions {
    /**
     * Set `duration` by path length, `duration = length / speed`.
     * E.g., `speed = 1`, `length = 500px`, final duration is `500ms`.
     * Replace `duration` parameter if specified.
     */
    speed?: number;
}
/**
 * When enter, draw the line or path from start to end.
 * When leave, erase the line or path from end to start.
 * Use Web Animations API, fallback to initial state after transition end.
 */
export declare const draw: (options?: DrawTransitionOptions | undefined) => import("../transition").TransitionResult<SVGGeometryElement, DrawTransitionOptions>;
