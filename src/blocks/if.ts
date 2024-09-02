import {Template, TemplateMaker, TemplateSlot} from '../template'


/** 
 * Make it by compiling:
 * ```
 * 	<if ${...}>...</if>
 * 	<elseif ${...}>...</elseif>
 * 	<else>...</else>
 * ```
 */
export class IfBlock {

	readonly indexFn: (values: any[]) => number
	readonly makers: (TemplateMaker | null)[]
	readonly slot: TemplateSlot
	readonly context: any

	private index = -1
	private template: Template | null = null

	constructor(indexFn: (values: any[]) => number, makers: (TemplateMaker | null)[], slot: TemplateSlot) {
		this.indexFn = indexFn
		this.makers = makers
		this.slot = slot
		this.context = slot.context
	}

	update(values: any[]) {
		let newIndex = this.indexFn(values)

		if (newIndex !== this.index) {
			let maker = newIndex >= 0 ? this.makers[newIndex] : null
			this.template = maker ? maker.make(this.context) : null
			this.slot.updateTemplateOnly(this.template, values)
			this.index = newIndex
		}
		else if (this.template) {
			this.template.update(values)
		}
	}
}



/** 
 * Make it by compiling:
 * ```
 * 	<if ${...} cache>...</if>
 * 	<elseif ${...}>...</elseif>
 * 	<else>...</else>
 * ```
 */
export class CacheableIfBlock {

	readonly indexFn: (values: any[]) => number
	readonly makers: (TemplateMaker | null)[]
	readonly slot: TemplateSlot
	readonly context: any

	private index = -1
	private templates: Map<number, Template | null> = new Map()
	private template: Template | null = null

	constructor(indexFn: (values: any[]) => number, makers: (TemplateMaker | null)[], slot: TemplateSlot, context: any) {
		this.indexFn = indexFn
		this.makers = makers
		this.slot = slot
		this.context = context
	}

	update(values: any[]) {
		let newIndex = this.indexFn(values)
		if (newIndex !== this.index) {
			let template: Template | null = null

			if (newIndex >= 0 && this.templates.has(newIndex)) {
				template = this.templates.get(newIndex)!
			}
			else if (newIndex >= 0) {
				let maker = this.makers[newIndex]
				template = maker ? maker.make(this.context) : null
				this.templates.set(newIndex, template)
			}
			
			this.slot.updateTemplateOnly(template, values)
			this.template = template
		}
		else if (this.template) {
			this.template.update(values)
		}
	}
}