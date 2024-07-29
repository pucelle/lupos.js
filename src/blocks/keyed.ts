import {Template, TemplateMaker, TemplateSlot} from '../template'


/** 
 * Make it by compiling:
 * ```
 * 	<keyed ${...}>...</keyed>
 * ```
 */
export class KeyedBlockMaker {

	readonly maker: TemplateMaker | null

	constructor(maker: TemplateMaker | null) {
		this.maker = maker
	}

	make(slot: TemplateSlot<null>, context: any) {
		return new KeyedBlock(this.maker, slot, context)
	}
}

/** Help to update block like `<keyed>`. */
class KeyedBlock {

	readonly maker: TemplateMaker | null
	readonly slot: TemplateSlot<null>
	readonly context: any

	private key: any = undefined
	private template: Template | null = null
	
	constructor(maker: TemplateMaker | null, slot: TemplateSlot<null>, context: any) {
		this.maker = maker
		this.slot = slot
		this.context = context
	}

	update(newKey: any, values: any[]) {
		if (newKey !== this.key) {
			this.template = this.maker ? this.maker.make(this.context) : null
			this.slot.updateTemplateOnly(this.template, values)
			this.key = newKey
		}
	}
}



/** 
 * Make it by compiling:
 * ```
 * 	<keyed ${...} cache>...</keyed>
 * ```
 */
export class CacheableKeyedBlockMaker {

	readonly maker: TemplateMaker | null

	constructor(maker: TemplateMaker | null) {
		this.maker = maker
	}

	make(slot: TemplateSlot<null>, context: any) {
		return new CacheableKeyedBlock(this.maker, slot, context)
	}
}

/** Help to update block like `<keyed cache>`. */
class CacheableKeyedBlock {

	readonly maker: TemplateMaker | null
	readonly slot: TemplateSlot<null>
	readonly context: any

	private key: any = undefined
	private templates: Map<number, Template | null> = new Map()
	
	constructor(maker: TemplateMaker | null, slot: TemplateSlot<null>, context: any) {
		this.maker = maker
		this.slot = slot
		this.context = context
	}

	update(newKey: any, values: any[]) {
		if (newKey === this.key) {
			return
		}

		let template: Template | null = null

		if (this.templates.has(newKey)) {
			template = this.templates.get(newKey)!
		}
		else {
			template = this.maker ? this.maker.make(this.context) : null
			this.templates.set(newKey, template)
		}

		this.slot.updateTemplateOnly(template, values)
		this.key = newKey
	}
}