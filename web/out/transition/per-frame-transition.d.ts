import { PerFrameTransitionEasingName } from './easing';
import { EventFirer } from '@pucelle/lupos';
import { TransitionAbleValue } from './types';
/** Transition events. */
export interface PerFrameTransitionEvents<T> {
    /** On each time progress got update. */
    'progress': (value: T, progress: number) => void;
    /** After begin to play transition. */
    'started': () => void;
    /** After continue to play transition. */
    'continued': () => void;
    /** After transition was cancelled. */
    'cancelled': () => void;
    /** After transition become finished. */
    'finished': () => void;
    /** After transition end. */
    'ended': (finish: boolean) => void;
}
/** Transition options. */
export interface PerFrameTransitionOptions {
    /**
     * Specifies default transition duration in milliseconds.
     * Default value is `200`.
     */
    duration?: number;
    /**
     * Specifies default transition easing type.
     * Default value is `ease-out-quad`.
     */
    easing?: PerFrameTransitionEasingName;
    /** Transition delay in milliseconds. */
    delay?: number;
}
/** Transition between start and end values per frame. */
export declare class PerFrameTransition<T extends TransitionAbleValue = any> extends EventFirer<PerFrameTransitionEvents<T>> {
    /** Default transition options. */
    static DefaultOptions: Required<PerFrameTransitionOptions>;
    /** Calculated easing function. */
    private easingFn;
    /** Options after fulfilled default values. */
    private options;
    /** Timeout when transition delay exist. */
    private delayTimeout;
    /** Animation frame loop. */
    private frameLoop;
    /** Transition promise. */
    private promise;
    /**
     * Be resolved after transition end.
     * Resolve parameter is whether transition finished.
     */
    private resolve;
    /** Help to mix values. */
    private mixer;
    /**
     * Start value.
     * Readonly outside.
     */
    startValue: T | null;
    /**
     * End value.
     * Readonly outside.
     */
    endValue: T | null;
    /**
     * Current value.
     * Readonly outside.
     */
    currentValue: T | null;
    /** A replaceable onprogress handler. */
    onprogress: ((value: T, progress: number) => void) | null;
    /**
     * Current transition progress, betweens `0~1`,
     * before easing mapped.
     * Readonly outside.
     */
    progress: number;
    constructor(options?: PerFrameTransitionOptions);
    /** Whether transition is playing, or will run. */
    get running(): boolean;
    /**
     * Update transition options.
     * Return whether any option has changed.
     */
    assignOptions(options?: Partial<PerFrameTransitionOptions>): boolean;
    /**
     * Be resolved after transition end.
     * Resolve parameter is whether transition finished.
     * If is not playing, resolved by `true`.
     */
    untilEnd(): Promise<boolean>;
    /**
     * Set play from values.
     * Only cancel current transition and update start values.
     * Returns `this`.
     */
    setFrom(startValue: T): this;
    /**
     * Play from start value to current value.
     * Returns a promise which will be resolved after transition end.
     * Work only when current value has been set before.
     * After transition ended, will persist current state.
     */
    playFrom(startValue: T, onprogress?: ((value: T, progress: number) => void) | null): Promise<boolean>;
    /**
     * Play from current value to end value.
     * Returns a promise which will be resolved after transition end.
     * Work only when start value has been set before.
     * After transition ended, will persist current state.
     */
    playTo(endValue: T, onprogress?: ((value: T, progress: number) => void) | null): Promise<boolean>;
    /**
     * Play between from and to values.
     * Returns a promise which will be resolved after transition end.
     * After transition end, will persist end state.
     */
    playBetween(startValue: T, endValue: T, onprogress?: ((value: T, progress: number) => void) | null): Promise<boolean>;
    /** Start transition after delay milliseconds. */
    private startDeferred;
    /** Start new transition immediately. */
    private startTransition;
    /** On each animation frame. */
    private onFrameLoop;
    /** Handle progress. */
    private onProgress;
    /** After transition finished. */
    private onFinish;
    /**
     * Finish current transition immediately,
     * and apply final state.
     */
    finish(): void;
    /**
     * Cancel current transition if is playing.
     * Note after cancelled, will persist current state, not apply final state.
     */
    cancel(): void;
    /** End, either finish or cancel. */
    private end;
}
