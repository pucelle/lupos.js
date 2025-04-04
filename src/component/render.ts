import {trackGet} from '@pucelle/ff'
import {TemplateSlot, SlotPosition, SlotPositionType, SlotEndOuterPositionType} from '../template'
import {Component} from './component'
import {RenderResult} from './types'


/** Rendered result, or a function to return it. */
export type RenderResultRenderer = RenderResult | (() => RenderResult)


/** 
 * Render a static content by parameter html`...` within a specified `context`,
 * or render a responsive content by parameter like `() => html`...`` within `context`.
 * 
 * E.g., render a popup or contextmenu based on current context after some interactions.
 * Returns a component like instance which attach to the context that provided.
 */
export function render(renderer: RenderResultRenderer, context: any = null): RenderedComponentLike {
	return new RenderedComponentLike(renderer, context)
}


/** 
 * Same as an anonymous component, except it attaches to a context,
 * and render all the things within that context.
 */
export class RenderedComponentLike<E = any> extends Component<E> {

	/** `context` can be overwritten. */
	context: any

	/** `renderer` can be overwritten. */
	renderer: RenderResultRenderer

	constructor(renderer: RenderResultRenderer, context: any) {
		super(document.createElement('slot'))
		
		this.renderer = renderer
		this.context = context
	}
	
	/** Replace context of content slot. */
	protected initContentSlot(): TemplateSlot {
		let position = new SlotPosition<SlotEndOuterPositionType>(SlotPositionType.AfterContent, this.el)
		return new TemplateSlot(position)
	}

	protected render(): RenderResult {
		trackGet(this, 'renderer')

		if (typeof this.renderer === 'function') {
			return this.renderer.call(this.context)
		}
		else {
			return this.renderer
		}
	}
}