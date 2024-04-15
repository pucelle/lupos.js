import {TransitionOptions, defineTransition} from './define'


/** 
 * When enter, fade opacity from 0 to initial opacity value.
 * When leave, fade opacity from initial opacity value to 0.
 */
export const fade = defineTransition(function(el: Element, options: TransitionOptions = {}) {
	let opacity = getComputedStyle(el).opacity

	return {
		...options,
		startFrame: {
			opacity: '0',
		},
		endFrame: {
			opacity,
		},
	}
})