import { WebTransitionEasingName } from './easing';
import { PerFrameTransitionEvents, PerFrameTransitionOptions } from './per-frame-transition';
import { EventFirer } from '@pucelle/lupos';
/**
 * Web Transition options, compare to `PerFrameTransitionOptions`,
 * some custom easing names have been excluded.
 */
export interface WebTransitionOptions extends PerFrameTransitionOptions {
    easing?: WebTransitionEasingName;
}
/** Web Transition events. */
export type WebTransitionEvents = Omit<PerFrameTransitionEvents<any>, 'progress'>;
/** Represent the start and end frame. */
export type WebTransitionKeyFrame = Partial<CSSStyleDeclaration>;
/** Uses web animations apis to play style transition. */
export declare class WebTransition extends EventFirer<WebTransitionEvents> {
    /** Default web transition options. */
    static DefaultOptions: Required<WebTransitionOptions>;
    /** The element transition playing at. */
    readonly el: Element;
    /** Options after fulfilled default values. */
    private readonly options;
    /** Running animation. */
    private animation;
    /** Transition promise. */
    private promise;
    /**
     * Be resolved after transition end.
     * Resolve parameter is whether transition finished.
     */
    private resolve;
    /**
     * Start frame.
     * Readonly outside.
     */
    startFrame: WebTransitionKeyFrame | null;
    /**
     * End frame.
     * Readonly outside.
     */
    endFrame: WebTransitionKeyFrame | null;
    constructor(el: Element, options?: WebTransitionOptions);
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
     * If is not playing, resolved by `true`, same as finish.
     */
    untilEnd(): Promise<boolean>;
    /**
     * Set start frame.
     * Only cancel current transition and update start frames.
     * Returns `this`.
     */
    setFrom(startFrame: WebTransitionKeyFrame): this;
    /**
     * Play from specified start frame to current state.
     * Returns a promise which will be resolved after transition end.
     * After transition ended, go back to initial state.
     */
    playFrom(startFrame: WebTransitionKeyFrame): Promise<boolean>;
    /**
     * Play from current frame to target end frame.
     * Returns a promise which will be resolved after transition end.
     *
     * By default when `applyFinalState` is `false`, after transition ended, go back to initial state.
     * If `applyFinalState` specified as `true`, will apply final state after transition end.
     *
     * If haven't set start frame, use current state as start frame.
     */
    playTo(endFrame: WebTransitionKeyFrame, applyFinalState?: boolean): Promise<boolean>;
    /**
     * Play between start and end frames.
     * Returns a promise which will be resolved after transition end.
     *
     * By default when `applyFinalState` is `false`, after transition ended, go back to initial state.
     * If `applyFinalState` specified as `true`, will apply final state after transition end.
     */
    playBetween(startFrame: WebTransitionKeyFrame, endFrame: WebTransitionKeyFrame, applyFinalState?: boolean): Promise<boolean>;
    /** Start playing transition. */
    private startPlaying;
    /**
     * Finish current transition immediately,
     * and fallback to initial state.
     */
    finish(): void;
    private onFinished;
    /**
     * Cancel current transition if is playing.
     * Note after cancelled, will fallback to initial state.
     */
    cancel(): void;
    private onCanceled;
    /** End, either finish or cancel. */
    private end;
}
