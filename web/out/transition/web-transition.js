import { getCSSEasingValue } from "./easing.js";
import { EventFirer, promiseWithResolves } from '@pucelle/lupos';
const DefaultWebTransitionOptions = {
    duration: 200,
    easing: 'ease-out-quad',
    delay: 0,
};
/** The style property, which doesn't use `0` as default value. */
const DefaultNotNumericStyleProperties = {
    transform: 'none'
};
/** Uses web animations apis to play style transition. */
export class WebTransition extends EventFirer {
    /** Default web transition options. */
    static DefaultOptions = DefaultWebTransitionOptions;
    /** The element transition playing at. */
    el;
    /** Options after fulfilled default values. */
    options;
    /** Running animation. */
    animation = null;
    /** Transition promise. */
    promise = null;
    /**
     * Be resolved after transition end.
     * Resolve parameter is whether transition finished.
     */
    resolve = null;
    /**
     * Start frame.
     * Readonly outside.
     */
    startFrame = null;
    /**
     * End frame.
     * Readonly outside.
     */
    endFrame = null;
    constructor(el, options = {}) {
        super();
        this.el = el;
        this.options = { ...DefaultWebTransitionOptions, ...options };
    }
    /** Whether transition is playing, or will run. */
    get running() {
        return !!this.animation && this.animation.playState === 'running';
    }
    /**
     * Update transition options.
     * Return whether any option has changed.
     */
    assignOptions(options = {}) {
        let changed = false;
        for (let [key, value] of Object.entries(options)) {
            if (this.options[key] !== value) {
                this.options[key] = value;
                changed = true;
            }
        }
        return changed;
    }
    /**
     * Be resolved after transition end.
     * Resolve parameter is whether transition finished.
     * If is not playing, resolved by `true`, same as finish.
     */
    async untilEnd() {
        if (this.promise) {
            return this.promise;
        }
        else {
            return true;
        }
    }
    /**
     * Set start frame.
     * Only cancel current transition and update start frames.
     * Returns `this`.
     */
    setFrom(startFrame) {
        this.cancel();
        this.startFrame = startFrame;
        return this;
    }
    /**
     * Play from specified start frame to current state.
     * Returns a promise which will be resolved after transition end.
     * After transition ended, go back to initial state.
     */
    playFrom(startFrame) {
        let endFrame = {};
        let style = getComputedStyle(this.el);
        for (let property of Object.keys(startFrame)) {
            endFrame[property] = style[property] || DefaultNotNumericStyleProperties[property] || '0';
        }
        this.startFrame = startFrame;
        this.endFrame = endFrame;
        return this.startPlaying();
    }
    /**
     * Play from current frame to target end frame.
     * Returns a promise which will be resolved after transition end.
     *
     * By default when `applyFinalState` is `false`, after transition ended, go back to initial state.
     * If `applyFinalState` specified as `true`, will apply final state after transition end.
     *
     * If haven't set start frame, use current state as start frame.
     */
    async playTo(endFrame, applyFinalState = false) {
        let startFrame = this.startFrame;
        if (!startFrame) {
            startFrame = {};
            let style = getComputedStyle(this.el);
            for (let property of Object.keys(endFrame)) {
                startFrame[property] = style[property] || DefaultNotNumericStyleProperties[property] || '0';
            }
        }
        return this.playBetween(startFrame, endFrame, applyFinalState);
    }
    /**
     * Play between start and end frames.
     * Returns a promise which will be resolved after transition end.
     *
     * By default when `applyFinalState` is `false`, after transition ended, go back to initial state.
     * If `applyFinalState` specified as `true`, will apply final state after transition end.
     */
    async playBetween(startFrame, endFrame, applyFinalState = false) {
        this.cancel();
        this.startFrame = startFrame;
        this.endFrame = endFrame;
        let finish = await this.startPlaying();
        // Apply final state.
        if (applyFinalState) {
            for (let [property, value] of Object.entries(endFrame)) {
                this.el.style.setProperty(property, value);
            }
        }
        return finish;
    }
    /** Start playing transition. */
    async startPlaying() {
        if (this.running) {
            this.fire('continued');
        }
        else {
            this.fire('started');
        }
        let easing = getCSSEasingValue(this.options.easing);
        let duration = this.options.duration;
        let delay = this.options.delay;
        this.animation = this.el.animate([this.startFrame, this.endFrame], {
            easing,
            duration,
            delay
        });
        let { promise, resolve } = promiseWithResolves();
        this.promise = promise;
        this.resolve = resolve;
        this.animation.onfinish = () => {
            this.onFinished();
        };
        this.animation.oncancel = () => {
            this.onCanceled();
        };
        let finish = await promise;
        if (finish) {
            this.startFrame = this.endFrame;
            this.endFrame = null;
        }
        return finish;
    }
    /**
     * Finish current transition immediately,
     * and fallback to initial state.
     */
    finish() {
        if (!this.animation) {
            return;
        }
        this.animation.finish();
    }
    onFinished() {
        this.fire('finished');
        this.end(true);
    }
    /**
     * Cancel current transition if is playing.
     * Note after cancelled, will fallback to initial state.
     */
    cancel() {
        if (!this.animation) {
            return;
        }
        this.animation.oncancel = null;
        this.animation.cancel();
        this.onCanceled();
    }
    onCanceled() {
        this.fire('cancelled');
        this.end(false);
    }
    /** End, either finish or cancel. */
    end(finish) {
        this.animation = null;
        this.promise = null;
        if (this.resolve) {
            this.resolve(finish);
            this.resolve = null;
        }
        this.fire('ended', finish);
    }
}
