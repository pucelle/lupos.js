/** 
 * Data Types that can be mixed.
 * 3 levels should be enough.
 */
export type TransitionAbleValue = CompositeOf<TransitionAbleValueBase>
	| CompositeOf<CompositeOf<TransitionAbleValueBase>>
	| CompositeOf<CompositeOf<CompositeOf<TransitionAbleValueBase>>>

type TransitionAbleValueBase = number | string | Mixable<any>
type CompositeOf<T extends any> = T | T[] | Record<any, T>

/** Such as vector, point, color. */
export type Mixable<T> = {mix(v: T, rate: number): T}

/** A mixer object to accept edge values and do mix later. */
export type Mixer<T = any> = (rate: number) => T
