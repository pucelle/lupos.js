import {TemplateResult, CompiledTemplateResult} from '../template'
import {Component} from './component'
import {RenderResult} from './types'


/** Render result, or a function to return it. */
export type RenderResultRenderer = TemplateResult | CompiledTemplateResult | (() => TemplateResult | CompiledTemplateResult)


/** 
 * Render a static content like html`...` inside a specified `context`,
 * Or render a responsive content like () => html`...` inside a specified `context`.
 *
 * E.g., render a popup or contextmenu based on current context after any interaction.
 * 
 * Returns a component like instance which attach to specified context. */
export function render(renderer: RenderResultRenderer, context: any = null): AttachedComponent {
	return new AttachedComponent(renderer, context)
}


/** 
 * Same with Component, except it attachs a context,
 * and render all the things within this context.
 */
class AttachedComponent<E = any> extends Component<E> {

	protected renderer: RenderResultRenderer
	protected context: Component<{}> | null

	constructor(renderer: RenderResultRenderer, context: Component | null) {
		super({}, document.createElement('lupos-slot'))
		
		this.renderer = renderer
		this.context = context
		this.rootContentSlot.replaceContext(context)
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