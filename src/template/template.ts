import {ContentPosition, ContentEndPositionType} from './contant-position'
import {TemplateResult} from './template-result'


// Compiler compile a html`<div>...` to new `CompiledTemplate('<div>...', CompiledTemplateInit)`.
export type TemplateInit = (templateEl: HTMLTemplateElement, context: any) => TemplateInitResult

export interface TemplateInitResult {

	/** End inner position, indicate the end edge of current content. */
	endInnerPosition: ContentPosition<ContentEndPositionType>

	update: () => void
	destroy?: () => void
}


/** Compile from any html`...`. */
export class Template {

	private templateString: string
	private templateEl: HTMLTemplateElement | null = null
	private init: TemplateInit

	constructor(templateString: string, init: TemplateInit) {
		this.templateString = templateString
		this.init = init
	}

	/** Bind with a context to create a `CompiledTemplateResult`. */
	create(context: any): TemplateResult {
		if (!this.templateEl) {
			this.templateEl = document.createElement('template')
			this.templateEl.innerHTML = this.templateString
		}

		let templateEl = this.templateEl.cloneNode(true) as HTMLTemplateElement
		return new TemplateResult(this, templateEl, this.init(templateEl, context))
	}
}
