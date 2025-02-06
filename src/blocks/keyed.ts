import {CompiledTemplateResult, Template, TemplateSlot} from '../template'


/** 
 * Make it by compiling:
 * ```
 * 	<keyed ${...}>...</keyed>
 * ```
 */
/** Help to update block like `<keyed>`. */
export class KeyedBlock {

	readonly slot: TemplateSlot

	private key: any = undefined
	private template: Template | null = null
	
	constructor(slot: TemplateSlot) {
		this.slot = slot
	}

	update(newKey: any, result: CompiledTemplateResult | null) {
		let template: Template | null = null

		if (newKey !== this.key) {
			template = result ? result.maker.make(result.context) : null
			this.key = newKey
		}
		else if (result && this.template && this.template.maker === result.maker) {
			template = this.template
		}
		else if (result) {
			template = result.maker.make(result.context)
		}

		this.slot.updateTemplateDirectly(template, result ? result.values : [])
	}
}
