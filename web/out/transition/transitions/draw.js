import { Transition } from "../transition.js";
import { assignWithoutKeys } from "./utils.js";
/**
 * When enter, draw the line or path from start to end.
 * When leave, erase the line or path from end to start.
 * Use Web Animations API, fallback to initial state after transition end.
 */
export const draw = /*#__PURE__*/ Transition.define(function (el, options = {}) {
    let { duration, speed } = options;
    let length = el.getTotalLength();
    if (speed !== undefined) {
        duration = length / speed;
    }
    let o = {
        startFrame: {
            strokeDasharray: String(length),
            strokeDashoffset: String(length),
        },
        endFrame: {
            strokeDasharray: String(length),
            strokeDashoffset: '0',
        },
    };
    if (duration !== undefined) {
        o.duration = duration;
    }
    return assignWithoutKeys(o, options, ['speed', 'duration']);
});
