import {Template, TemplateMaker, TemplateSlot} from '../template'


/** 
 * Make it by compiling:
 * ```
 * 	<keyed ${...}>...</keyed>
 * ```
 */
/** Help to update block like `<keyed>`. */
export class KeyedBlock {

	readonly maker: TemplateMaker | null
	readonly slot: TemplateSlot
	readonly context: any

	private key: any = undefined
	private template: Template | null = null
	
	constructor(maker: TemplateMaker | null, slot: TemplateSlot) {
		this.maker = maker
		this.slot = slot
		this.context = slot.context
	}

	update(newKey: any, values: any[]) {
		if (newKey !== this.key) {
			this.template = this.maker ? this.maker.make(this.context, values) : null
			this.slot.updateTemplateOnly(this.template, values)
			this.key = newKey
		}
		else if (this.template) {
			this.template.update(values)
		}
	}
}



/** 
 * Make it by compiling:
 * ```
 * 	<keyed ${...} cache>...</keyed>
 * ```
 */
export class CacheableKeyedBlock {

	readonly maker: TemplateMaker | null
	readonly slot: TemplateSlot
	readonly context: any

	private key: any = undefined
	private templates: Map<number, Template | null> = new Map()
	private template: Template | null = null

	constructor(maker: TemplateMaker | null, slot: TemplateSlot, context: any) {
		this.maker = maker
		this.slot = slot
		this.context = context
	}

	update(newKey: any, values: any[]) {
		if (newKey !== this.key) {
			let template: Template | null = null

			if (this.templates.has(newKey)) {
				template = this.templates.get(newKey)!
			}
			else {
				template = this.maker ? this.maker.make(this.context, values) : null
				this.templates.set(newKey, template)
			}

			this.slot.updateTemplateOnly(template, values)
			this.key = newKey
			this.template = template
		}
		else if (this.template) {
			this.template.update(values)
		}
	}
}