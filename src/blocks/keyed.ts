import {Template, TemplateMaker, TemplateSlot} from '../template'


/** Type of compiling all the statement like `<keyed ${}>...`. */
type KeyedBlockStatement = (slot: TemplateSlot, context: any) => (key: any, values: any[]) => void


/** 
 * Make it by compiling:
 * ```
 * 	<keyed ${...}>...</keyed>
 * ```
 */
export function make_keyed_statement(maker: TemplateMaker | null): KeyedBlockStatement {
	return function(slot: TemplateSlot, context: any) {
		let key: any = undefined
		let template: Template | null = null
	
		return function(newKey: any, values: any[]) {
			if (newKey !== key) {
				template = maker ? maker.make(context) : null
				slot.updateTemplate(template)
				key = newKey
			}

			if (template) {
				template.update(values)
			}
		}
	}
}