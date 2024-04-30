import {TemplateSlotPosition, TemplateSlotStartInnerPositionType} from './template-slot-position'
import {Template} from './template'
import {Part} from '../types'


/** Compiler compile a html`<div>...` to new `TemplateMaker('<div>...', TemplateInitFn)`. */
export type TemplateInitFn = (context: any) => TemplateInitResult

/** Part of contents compiled from a template literal. */
export interface TemplateInitResult {

	/** 
	 * Cache all nodes of template.
	 * If no element, and no part, ignore it.
	 */
	el?: HTMLTemplateElement

	/** Start inner position, indicate the end edge of current content. */
	position: TemplateSlotPosition<TemplateSlotStartInnerPositionType>

	/** Update and apply new values. */
	update?: (values: any[]) => void

	/** 
	 * List of all parts inside.
	 * Second value is the AND of each `PartCallbackParameter`, can be `1` or `3`,
	 * it represents whether part in the first level (under root) of template,
	 */
	parts?: [Part, number][]
}


/** Compile from any html`...`. */
export class TemplateMaker {

	private init: TemplateInitFn

	constructor(init: TemplateInitFn) {
		this.init = init
	}

	/** Bind with a context to create a `CompiledTemplateResult`. */
	make(context: any): Template {
		return new Template(this, this.init(context))
	}
}
