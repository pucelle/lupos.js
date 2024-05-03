import {Template, TemplateMaker, TemplateSlot} from '../template'
import {PartCallbackParameter} from '../types'


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
export function createkeyedBlockFn(maker: TemplateMaker | null): KeyedBlock {
	return function(slot: TemplateSlot<null>, context: any) {
		let key: any = undefined
		let template: Template | null = null
	
		return {
			update(newKey: any, values: any[]) {
				if (newKey !== key) {
					template = maker ? maker.make(context) : null
					slot.updateTemplateOnly(template)
					key = newKey
				}

				if (template) {
					template.update(values)
					template.afterConnectCallback(PartCallbackParameter.HappenInCurrentContext | PartCallbackParameter.DirectNodeToMove)
				}
			}
		}
	}
}
