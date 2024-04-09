import {TemplateSlotPosition, SlotStartInnerPositionType} from './template-slot-position'
import {Template} from './template'


// Compiler compile a html`<div>...` to new `CompiledTemplate('<div>...', CompiledTemplateInit)`.
export type TemplateInit = (templateEl: HTMLTemplateElement, context: any) => TemplateInitResult

export interface TemplateInitResult {

	/** End inner position, indicate the end edge of current content. */
	startInnerPosition: TemplateSlotPosition<SlotStartInnerPositionType>

	/** Update and apply new values. */
	update: (values: any[]) => void
}


/** Compile from any html`...`. */
export class TemplateMaker {

	private templateString: string
	private templateEl: HTMLTemplateElement | null = null
	private init: TemplateInit

	constructor(templateString: string, init: TemplateInit) {
		this.templateString = templateString
		this.init = init
	}

	/** Bind with a context to create a `CompiledTemplateResult`. */
	make(context: any): Template {
		if (!this.templateEl) {
			this.templateEl = document.createElement('template')
			this.templateEl.innerHTML = this.templateString
		}

		let templateEl = this.templateEl.cloneNode(true) as HTMLTemplateElement
		return new Template(templateEl, this, this.init(templateEl, context))
	}
}
