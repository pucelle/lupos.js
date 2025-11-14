import { Transition } from "../transition.js";
import { assignWithoutKeys } from "./utils.js";
/**
 * When enter, translate and fade from specified values to none.
 * When leave, translate and fade from none to specified values.
 *
 * Use Web Animations API, fallback to initial state after transition end.
 */
export const fly = /*#__PURE__*/ Transition.define(function (_el, options = {}) {
    let x = options.x || 0;
    let y = options.y || 0;
    if (typeof x === 'number') {
        x = x + 'px';
    }
    if (typeof y === 'number') {
        y = y + 'px';
    }
    let flyTransform = new DOMMatrix(`translate(${x}, ${y})`);
    let o = {
        startFrame: {
            transform: flyTransform.toString(),
        },
        endFrame: {
            transform: 'none',
        },
    };
    if (options.fade) {
        o.startFrame.opacity = '0';
        o.endFrame.opacity = '1';
    }
    return assignWithoutKeys(o, options, ['x', 'y', 'fade']);
});
