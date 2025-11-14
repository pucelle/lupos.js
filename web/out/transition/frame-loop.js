import { AnimationFrame } from '@pucelle/lupos';
/** Repeated animation frames. */
export class FrameLoop {
    /**
     * Whether current time control has been canceled.
     * Readonly outside.
     */
    canceled = false;
    /** The original function to call after timeout. */
    fn;
    /** Animation frame id, `null` represents it's not exist. */
    id = null;
    startTimestamp = 0;
    constructor(fn) {
        this.fn = fn;
    }
    /** Whether frame loop is running. */
    get running() {
        return !!this.id;
    }
    /**
     * Restart animation frame, even it was canceled before.
     * Calls `fn` with duration parameter `0` immediately.
     */
    reset() {
        if (this.id !== null) {
            AnimationFrame.cancel(this.id);
        }
        this.id = AnimationFrame.requestCurrent(this.onCurrentFrame.bind(this));
        this.canceled = false;
        this.fn(0);
    }
    /**
     * Start or restart animation frame, even it was canceled before.
     * Calls `fn` with duration parameter `0` immediately.
     */
    start() {
        this.reset();
    }
    onCurrentFrame(timestamp) {
        this.startTimestamp = timestamp;
        this.id = AnimationFrame.requestNext(this.onFrame.bind(this));
    }
    onFrame(timestamp) {
        this.id = AnimationFrame.requestNext(this.onFrame.bind(this));
        // Calls `fn` must after request animation frame,
        // Or will fail if cancel inside `fn`.
        this.fn(timestamp - this.startTimestamp);
    }
    /** Just restart animation frame. */
    flush() {
        this.reset();
    }
    /** Cancel animation frame. */
    cancel() {
        if (this.id !== null) {
            AnimationFrame.cancel(this.id);
            this.id = null;
        }
        this.canceled = true;
    }
}
