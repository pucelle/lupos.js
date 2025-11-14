/** Callback with a timestamp as parameter. */
type FrameLoopCallback = (duration: number) => void;
/** Repeated animation frames. */
export declare class FrameLoop<F extends FrameLoopCallback = FrameLoopCallback> {
    /**
     * Whether current time control has been canceled.
     * Readonly outside.
     */
    canceled: boolean;
    /** The original function to call after timeout. */
    fn: F;
    /** Animation frame id, `null` represents it's not exist. */
    protected id: any;
    private startTimestamp;
    constructor(fn: F);
    /** Whether frame loop is running. */
    get running(): boolean;
    /**
     * Restart animation frame, even it was canceled before.
     * Calls `fn` with duration parameter `0` immediately.
     */
    reset(): void;
    /**
     * Start or restart animation frame, even it was canceled before.
     * Calls `fn` with duration parameter `0` immediately.
     */
    start(): void;
    private onCurrentFrame;
    private onFrame;
    /** Just restart animation frame. */
    flush(): void;
    /** Cancel animation frame. */
    cancel(): void;
}
export {};
