import {TemplateSlotPosition, SlotStartInnerPositionType} from './template-slot-position'
import {Template} from './template'
import {Part} from '../types'


/** Compiler compile a html`<div>...` to new `CompiledTemplate('<div>...', CompiledTemplateInit)`. */
export type TemplateInit = (templateEl: HTMLTemplateElement, context: any) => TemplateInitResult

/** Part of contents compiled from a template literal. */
export interface TemplateInitResult {

	/** End inner position, indicate the end edge of current content. */
	p: TemplateSlotPosition<SlotStartInnerPositionType>

	/** Update and apply new values. */
	u?: (values: any[]) => void

	/** 
	 * List of all parts inside.
	 * Second value is the AND of each `PartCallbackParameter`, can be `1` or `3`,
	 * it represents whether part in the first level (under root) of template,
	 */
	l?: [Part, number][]
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
