import { Transition } from "../transition.js";
/**
 * When enter, play from `startFrame` to `endFrame`.
 * When leave, play from `endFrame` to `startFrame`.
 * Use Web Animations API, fallback to initial state after transition end.
 */
export const rangeFrames = /*#__PURE__*/ Transition.define(function (_el, options) {
    return options;
});
