import { Mixer, TransitionAbleValue } from "./types";
/**
 * Make a mixer to mix two values and make a getter,
 * which can get a mixed value at any rate later.
 */
export declare function makeMixer<T extends TransitionAbleValue>(fromValue: T, toValue: T): Mixer<T>;
