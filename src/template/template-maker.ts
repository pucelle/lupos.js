import {SlotPosition, SlotStartInnerPositionType} from './slot-position'
import {Template} from './template'
import {Part} from '../types'


/** Compiler compile a html`<div>...` to new `TemplateMaker('<div>...', TemplateInitFn)`. */
export type TemplateInitFn = (context: any) => TemplateInitResult

/** Part of contents compiled from a template literal. */
export interface TemplateInitResult {

	/** Template element to initialize all nodes inside. */
	el: HTMLTemplateElement

	/** Start inner position, indicate the start edge of current content. */
	position: SlotPosition<SlotStartInnerPositionType>

	/** 
	 * Update and apply new values.
	 * If nothing needs to be updated, ignores it.
	 */
	update?: (values: any[]) => void

	/** 
	 * List of all parts inside.
	 * Second value is the AND operate of each `PartCallbackParameter`, can be `1` or `3`,
	 * If no parts inside, ignores it.
	 */
	parts?: [Part, number][]
}


/** Compile from any html`...`. */
export class TemplateMaker {

	private init: TemplateInitFn

	constructor(init: TemplateInitFn) {
		this.init = init
	}

	/** Bind with a context to create a Template. */
	make(context: any): Template {
		return new Template(this.init(context), this)
	}
}
