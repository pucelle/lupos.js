import { getEasingFunction } from "./easing.js";
import { makeMixer } from "./mixer.js";
import { EventFirer, promiseWithResolves } from '@pucelle/lupos';
import { FrameLoop } from "./frame-loop.js";
const DefaultPerFrameTransitionOptions = {
    duration: 200,
    easing: 'ease-out-quad',
    delay: 0,
};
/** Transition between start and end values per frame. */
export class PerFrameTransition extends EventFirer {
    /** Default transition options. */
    static DefaultOptions = DefaultPerFrameTransitionOptions;
    /** Calculated easing function. */
    easingFn = null;
    /** Options after fulfilled default values. */
    options;
    /** Timeout when transition delay exist. */
    delayTimeout;
    /** Animation frame loop. */
    frameLoop;
    /** Transition promise. */
    promise = null;
    /**
     * Be resolved after transition end.
     * Resolve parameter is whether transition finished.
     */
    resolve = null;
    /** Help to mix values. */
    mixer = null;
    /**
     * Start value.
     * Readonly outside.
     */
    startValue = null;
    /**
     * End value.
     * Readonly outside.
     */
    endValue = null;
    /**
     * Current value.
     * Readonly outside.
     */
    currentValue = null;
    /** A replaceable onprogress handler. */
    onprogress = null;
    /**
     * Current transition progress, betweens `0~1`,
     * before easing mapped.
     * Readonly outside.
     */
    progress = 0;
    constructor(options = {}) {
        super();
        this.options = { ...DefaultPerFrameTransitionOptions, ...options };
        this.delayTimeout = new Timeout(this.startTransition.bind(this), this.options.delay);
        this.frameLoop = new FrameLoop(this.onFrameLoop.bind(this));
        this.easingFn = getEasingFunction(this.options.easing);
    }
    /** Whether transition is playing, or will run. */
    get running() {
        return !!this.promise;
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
        if (changed) {
            this.easingFn = getEasingFunction(this.options.easing);
        }
        return changed;
    }
    /**
     * Be resolved after transition end.
     * Resolve parameter is whether transition finished.
     * If is not playing, resolved by `true`.
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
     * Set play from values.
     * Only cancel current transition and update start values.
     * Returns `this`.
     */
    setFrom(startValue) {
        this.cancel();
        this.startValue = startValue;
        this.currentValue = startValue;
        return this;
    }
    /**
     * Play from start value to current value.
     * Returns a promise which will be resolved after transition end.
     * Work only when current value has been set before.
     * After transition ended, will persist current state.
     */
    playFrom(startValue, onprogress = null) {
        if (this.currentValue === null) {
            throw new Error(`Must call "setFrom" or "playBetween" firstly!`);
        }
        this.cancel();
        this.startValue = startValue;
        this.endValue = this.currentValue;
        this.mixer = makeMixer(this.startValue, this.endValue);
        this.onprogress = onprogress;
        return this.startDeferred();
    }
    /**
     * Play from current value to end value.
     * Returns a promise which will be resolved after transition end.
     * Work only when start value has been set before.
     * After transition ended, will persist current state.
     */
    playTo(endValue, onprogress = null) {
        if (this.currentValue === null) {
            throw new Error(`Must call "playFrom" or "playBetween" firstly!`);
        }
        this.cancel();
        this.startValue = this.currentValue;
        this.endValue = endValue;
        this.mixer = makeMixer(this.startValue, this.endValue);
        this.onprogress = onprogress;
        return this.startDeferred();
    }
    /**
     * Play between from and to values.
     * Returns a promise which will be resolved after transition end.
     * After transition end, will persist end state.
     */
    playBetween(startValue, endValue, onprogress = null) {
        this.cancel();
        this.startValue = startValue;
        this.endValue = endValue;
        this.currentValue = startValue;
        this.mixer = makeMixer(startValue, endValue);
        this.onprogress = onprogress;
        return this.startDeferred();
    }
    /** Start transition after delay milliseconds. */
    startDeferred() {
        if (this.running) {
            this.fire('continued');
        }
        else {
            this.fire('started');
        }
        let { promise, resolve } = promiseWithResolves();
        this.promise = promise;
        this.resolve = resolve;
        this.delayTimeout.start();
        return promise;
    }
    /** Start new transition immediately. */
    startTransition() {
        this.frameLoop.start();
    }
    /** On each animation frame. */
    onFrameLoop(duration) {
        let x = linearStep(duration, 0, this.options.duration);
        this.onProgress(x);
        // Finished.
        if (x === 1) {
            this.onFinish();
        }
    }
    /** Handle progress. */
    onProgress(x) {
        let y = this.easingFn(x);
        this.progress = x;
        this.currentValue = this.mixer(y);
        if (this.onprogress) {
            this.onprogress(this.currentValue, x);
        }
        this.fire('progress', this.currentValue, x);
    }
    /** After transition finished. */
    onFinish() {
        this.fire('finished');
        this.end(true);
    }
    /**
     * Finish current transition immediately,
     * and apply final state.
     */
    finish() {
        if (!this.running) {
            return;
        }
        this.onProgress(1);
        this.fire('finished');
        this.end(true);
    }
    /**
     * Cancel current transition if is playing.
     * Note after cancelled, will persist current state, not apply final state.
     */
    cancel() {
        if (!this.running) {
            return;
        }
        this.fire('cancelled');
        this.end(false);
    }
    /** End, either finish or cancel. */
    end(finish) {
        this.delayTimeout.cancel();
        this.frameLoop.cancel();
        this.promise = null;
        this.mixer = null;
        if (this.resolve) {
            this.resolve(finish);
            this.resolve = null;
        }
        this.fire('ended', finish);
    }
}
/**
 * Returns a value betweens 0~1 which represent the rate of number x inside range `min` and `max`.
 * Get a rate that indicates the rate of `max` value to mix.
 */
function linearStep(x, min, max) {
    if (x <= min) {
        return 0;
    }
    if (x >= max) {
        return 1;
    }
    x = (x - min) / (max - min) || 0;
    return x;
}
/**
 * Class mode of `setTimeout`.
 * Note it doesn't start automatically.
 */
class Timeout {
    /** The original function to call after timeout. */
    fn;
    /** Get or set the associated time in milliseconds. */
    ms;
    /** Timeout id, `null` represents it's not exist. */
    id = null;
    constructor(fn, ms) {
        this.fn = fn;
        this.ms = ms;
    }
    /** Whether timeout is running. */
    get running() {
        return !!this.id;
    }
    /** Restart timeout, even a called or canceled Timeout can be restarted. */
    reset() {
        if (this.id !== null) {
            clearTimeout(this.id);
        }
        this.id = setTimeout(this.onTimeout.bind(this), this.ms);
    }
    /** Start or restart timeout, even a called or canceled Timeout can be restarted. */
    start() {
        this.reset();
    }
    onTimeout() {
        this.id = null;
        this.fn();
    }
    /** Cancel timeout. */
    cancel() {
        if (this.id !== null) {
            clearTimeout(this.id);
            this.id = null;
        }
    }
}
