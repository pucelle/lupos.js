import {Template, TemplateMaker, TemplateSlot} from '../template'


/** Type of compiling all the statement like `<if>...`, `<switch>...`. */
export type IfBlockStatement = (slot: TemplateSlot, context: any) => (values: any[]) => void


/** 
 * Make it by compiling:
 * ```
 * 	<if ${...}>...</if>
 * 	<elseif ${...}>...</elseif>
 * 	<else ${...}>...</else>
 * ```
 */
export function make_if_statement(
	indexFn: (values: any[]) => number,
	makers: (TemplateMaker | null)[]
): IfBlockStatement {
	return function(slot: TemplateSlot, context: any) {
		let index = -1
		let template: Template | null = null
	
		return function(values: any[]) {
			let newIndex = indexFn(values)

			if (newIndex !== index) {
				let maker = newIndex >= 0 ? makers[newIndex] : null
				template = maker ? maker.make(context) : null
				slot.updateTemplate(template)
				index = newIndex
			}

			if (template) {
				template.update(values)
			}
		}
	}
}


/** 
 * Make it by compiling:
 * ```
 * 	<if ${...} cache>...</if>
 * 	<elseif ${...}>...</elseif>
 * 	<else ${...}>...</else>
 * ```
 */
export function make_if_statement_cacheable(
	indexFn: (values: any[]) => number,
	makers: (TemplateMaker | null)[]
): IfBlockStatement {
	return function(slot: TemplateSlot, context: any) {
		let index = -1
		let templates: Map<number, Template | null> = new Map()
	
		return function(values: any[]) {
			let newIndex = indexFn(values)
			let template: Template | null = null

			if (newIndex !== index) {
				if (newIndex >= 0 && templates.has(newIndex)) {
					template = templates.get(newIndex)!
				}
				else if (newIndex >= 0) {
					let maker = makers[newIndex]
					template = maker ? maker.make(context) : null
					templates.set(newIndex, template)
				}
				
				slot.updateTemplate(template)
			}

			if (template) {
				template.update(values)
			}
		}
	}
}