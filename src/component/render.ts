import {TemplateResult, CompiledTemplateResult, TemplateSlot, SlotPosition, SlotPositionType} from '../template'
import {Component} from './component'
import {RenderResult} from './types'


/** Render result, or a function to return it. */
export type RenderResultRenderer<T = any> = TemplateResult | CompiledTemplateResult | ((this: T) => TemplateResult | CompiledTemplateResult)


/** 
 * Render a static content by parameter html`...` within a specified `context`,
 * Or render a responsive content by parameter like () => html`...` within a specified `context`.
 * E.g., render a popup or contextmenu based on current context after some interactions.
 * Returns a component like instance which attach to the context we provided.
 */
export function render<T = any>(renderer: RenderResultRenderer<T>, context: T = null as T): AttachedComponent {
	return new AttachedComponent(renderer, context)
}


/** 
 * Same as a anonymous component, except it attaches a context,
 * and render all the things within that context.
 */
class AttachedComponent<E = any> extends Component<E> {

	protected renderer: RenderResultRenderer
	protected context: any

	constructor(renderer: RenderResultRenderer, context: any) {
		super({}, document.createElement('slot'))
		
		this.renderer = renderer
		this.context = context
	}
	
	/** Replace context of content slot. */
	protected initContentSlot(): TemplateSlot {
		let position = new SlotPosition<SlotPositionType.AfterContent>(SlotPositionType.AfterContent, this.el)
		return new TemplateSlot(position, this.context)
	}

	protected render(): RenderResult {
		if (typeof this.renderer === 'function') {
			return this.renderer()
		}
		else {
			return this.renderer
		}
	}
}