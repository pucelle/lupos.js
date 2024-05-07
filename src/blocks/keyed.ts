import {Template, TemplateMaker, TemplateSlot} from '../template'


/** Type of compiling all the statement like `<keyed ${}>...`. */
type KeyedBlock = (slot: TemplateSlot<null>, context: any) => {
	update(key: any, values: any[]): void
}

/** 
 * Make it by compiling:
 * ```
 * 	<keyed ${...}>...</keyed>
 * ```
 */
export function createKeyedBlockFn(maker: TemplateMaker | null): KeyedBlock {
	return function(slot: TemplateSlot<null>, context: any) {
		let key: any = undefined
		let template: Template | null = null
	
		return {
			update(newKey: any, values: any[]) {
				if (newKey !== key) {
					template = maker ? maker.make(context) : null
					slot.updateTemplateOnly(template, values)

					key = newKey
				}
			}
		}
	}
}
