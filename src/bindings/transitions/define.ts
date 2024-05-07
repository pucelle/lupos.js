import {PerFrameTransitionOptions, WebTransitionKeyFrame} from '@pucelle/ff'


export interface TransitionOptions extends PerFrameTransitionOptions {

	/** 
	 * Specifies transition direction.
	 * E.g., if specifies to `enter` and need to play leave transition, nothing happens.
	 * Default value is `both`.
	 */
	direction?: TransitionDirection
}

/** 
 * Transition direction, includes enter and leave part.
 * Only direction is allowed the transition can play.
 */
export type TransitionDirection = 'enter' | 'leave' | 'both' | 'none'

export interface WebTransitionProperties extends TransitionOptions {

	/** 
	 * Start frame, specifies the start state of enter or end state of leave.
	 * It's normally a "zero" state.
	 */
	startFrame: WebTransitionKeyFrame

	/** 
	 * End frame, specifies the end state of enter or start state of leave.
	 * It's normally a "100%" state.
	 */
	endFrame: WebTransitionKeyFrame
}

export interface PerFrameTransitionProperties extends TransitionOptions {

	/**
	 * Process somethings per frame.
	 * `progress` betweens `0~1`.
	 */
	perFrame: (progress: number) => void
}

/** 
 * Transition properties to decide how to run the transition,
 * A defined transition getter should return this.
 * It's decided by target element and options for this transition getter.
 */
export type TransitionProperties = WebTransitionProperties | PerFrameTransitionProperties

/** 
 * A transition getter,
 * it accepts target element and options for this transition getter,
 * and return transition properties.
 * 
 * Can either return a transition properties, null, or a promise resolved by these.
 * 
 * Normally you should choose returning `startFrame` and `endFrame` to use web transition.
 */
export type TransitionPropertiesGetter<E extends Element, O extends TransitionOptions | undefined>
	= (el: E, options: O, phase: 'enter' | 'leave') => TransitionProperties | null | Promise<TransitionProperties | null>


/** 
 * Define a transition, it accepts a transition getter,
 * which make a transition properties object from target element and some options.
 * And output a function which returns an object to cache this getter and captured options.
 * 
 * Note uses `defineTransition` cause executing codes in top level,
 * so you may need to set `sideEffects: false` to make tree shaking work as expected.
 */
export function defineTransition<E extends Element, O extends TransitionOptions>(
	getter: TransitionPropertiesGetter<E, O>
): (options?: O) => TransitionResult
{
	return function(options: O | undefined) {
		return new TransitionResult(getter, options)
	}
}


/**
 * Class used to play specified transition on an element.
 * Transition types includes class name, css properties, and registered js transition.
 */
export class TransitionResult {

	readonly getter: TransitionPropertiesGetter<any, any>
	readonly options: any

	constructor(getter: TransitionPropertiesGetter<any, any>, options: any) {
		this.getter = getter
		this.options = options
	}
}
