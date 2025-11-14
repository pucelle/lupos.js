import { Transition } from "../transition.js";
import { assignWithoutKeys } from "./utils.js";
/**
 * When enter, do blur filter from with radius from specified value to 0.
 * When leave, do blur filter from with radius from 0 to specified value.
 * Use Web Animations API, fallback to initial state after transition end.
 */
export const blur = /*#__PURE__*/ Transition.define(function (_el, options = { radius: 5 }) {
    let blurValue = typeof options.radius === 'number' ? options.radius + 'px' : options.radius;
    let o = {
        startFrame: {
            filter: `blur(${blurValue})`,
        },
        endFrame: {
            filter: 'none',
        },
    };
    if (options.fade) {
        o.startFrame.opacity = '0';
        o.endFrame.opacity = '1';
    }
    return assignWithoutKeys(o, options, ['radius', 'fade']);
});
