import {CompiledTemplateResult, Template, TemplateMaker, TemplateSlot} from '../template'


/** 
 * Make it by compiling:
 * ```
 * 	<if ${...}>...</if>
 * 	<elseif ${...}>...</elseif>
 * 	<else>...</else>
 * ```
 */
export class IfBlock {

	readonly slot: TemplateSlot
	readonly context: any

	constructor(slot: TemplateSlot) {
		this.slot = slot
		this.context = slot.context
	}

	update(result: CompiledTemplateResult | null) {
		this.slot.update(result)
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

	readonly slot: TemplateSlot
	readonly context: any

	private templates: Map<TemplateMaker, Template | null> = new Map()

	constructor(slot: TemplateSlot) {
		this.slot = slot
		this.context = slot.context
	}

	update(result: CompiledTemplateResult | null) {
		let template = result ? this.templates.get(result.maker) ?? null : null
		
		if (!template && result) {
			template = result.maker.make(this.context, result.values)
			this.templates.set(result.maker, template)
		}

		this.slot.updateTemplateDirectly(template, result ? result.values : [])
	}
}