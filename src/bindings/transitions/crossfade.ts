import {BarrierQueue, DoubleKeysMap, Matrix, ObjectUtils} from '@pucelle/ff'
import {TransitionOptions, TransitionProperties, TransitionResult, defineTransition} from './define'


export interface CrossFadeTransitionOptions extends TransitionOptions {

	/** The key to match a pair of elements. */
	key: string | number

	/** 
	 * Define the fallback transition when no matched element.
	 * E.g., `{fallback: fade()}`.
	 * By default no fallback defined, no transition will be played.
	 */
	fallback?: TransitionResult
}


/** Cache "Crossfade Key" -> "enter / leave" -> Element. */
const CrossFadeElementMatchMap: DoubleKeysMap<string | number, 'enter' | 'leave', Element> = new DoubleKeysMap()

/** 
 * Help to sync enter and leave cross fade transitions,
 * makesure they can communite before playing, for `crossfade` transition.
 */
const CrossFadeTransitionBarrierQueue = new BarrierQueue()

/** 
 * When enter, transform from the leave element to current state.
 * When leave, transform from current state to the leave element.
 * So you can see one element cross fade to another element.
 */
export const crossfade = defineTransition(async function(el: Element, options: CrossFadeTransitionOptions, phase: 'enter' | 'leave') {
	CrossFadeElementMatchMap.set(options.key, phase, el)

	// Sync same keyed enter and leave transitions.
	await CrossFadeTransitionBarrierQueue.barrier(0)

	let oppositePhase: 'enter' | 'leave' = phase === 'enter' ? 'leave' : 'enter'
	let oppositeEl = CrossFadeElementMatchMap.get(options.key, oppositePhase)

	// Fallback when there is no opposite element.
	if (!oppositeEl) {
		let fallback = options.fallback
		if (!fallback) {
			return null
		}

		return fallback.getter(el, fallback.options, phase)
	}

	let boxEl = el.getBoundingClientRect()
	let boxOp = oppositeEl.getBoundingClientRect()

	// Transform box of current element to box of opposite element.
	let transform = Matrix.fromBoxPair(boxEl, boxOp)

	let o: TransitionProperties = {
		startFrame: {
			transform: transform.toString(),
			opacity: '0',
		},
		endFrame: {
			transform: 'none',
			opacity: getComputedStyle(el).opacity,
		},
	}

	return ObjectUtils.assignExclude(o, options, ['key', 'fallback'])
})