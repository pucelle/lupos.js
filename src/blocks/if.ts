import {Template, TemplateMaker, TemplateSlot} from '../template'
import {PartCallbackParameter} from '../types'


/** Type of compiling statements like `<if>...`, `<switch>...`. */
type IfBlock = (slot: TemplateSlot<null>, context: any) => {
	update(values: any[]): void
}


/** 
 * Make it by compiling:
 * ```
 * 	<if ${...}>...</if>
 * 	<elseif ${...}>...</elseif>
 * 	<else ${...}>...</else>
 * ```
 */
export function createIfBlockFn(
	indexFn: (values: any[]) => number,
	makers: (TemplateMaker | null)[]
): IfBlock
{
	return function(slot: TemplateSlot<any>, context: any) {
		let index = -1
		let template: Template | null = null
	
		return {
			update(values: any[]) {
				let newIndex = indexFn(values)

				if (newIndex !== index) {
					let maker = newIndex >= 0 ? makers[newIndex] : null
					template = maker ? maker.make(context) : null
					slot.updateTemplateOnly(template)
					index = newIndex
				}

				if (template) {
					template.update(values)
					template.afterConnectCallback(PartCallbackParameter.HappenInCurrentContext | PartCallbackParameter.DirectNodeToMove)
				}
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
export function createCacheableIfBlockFn(
	indexFn: (values: any[]) => number,
	makers: (TemplateMaker | null)[]
): IfBlock
{
	return function(slot: TemplateSlot<null>, context: any) {
		let index = -1
		let templates: Map<number, Template | null> = new Map()
	
		return {
			update(values: any[]) {
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
					
					slot.updateTemplateOnly(template)
				}

				if (template) {
					template.update(values)
					template.afterConnectCallback(PartCallbackParameter.HappenInCurrentContext | PartCallbackParameter.DirectNodeToMove)
				}
			}
		}
	}
}