import {Template, TemplateMaker, TemplateSlot} from '../template'
import {PartCallbackParameter} from '../types'


/** Type of compiling statements like `<await>...`. */
type AwaitBlock = (slot: TemplateSlot<null>, context: any) => {

	/** 
	 * Note update await block or resolve awaiting promise must wait
	 * for a micro task tick, then template will begin to update.
	 */
	update(promise: Promise<any>, values: any[]): void
}


/** 
 * Make it by compiling:
 * ```
 * 	<await ${...}>...</await>
 * 	<then>...</then>
 * 	<catch>...</catch>
 * ```
 */
export function createAwaitBlockFn(makers: (TemplateMaker | null)[]): AwaitBlock {
	return function(slot: TemplateSlot<null>, context: any) {
		let promise: Promise<any> | null = null
		let values: any[] | null = null
		let template: Template | null = null

		function updateIndex(index: number) {
			let maker = makers[index]
			template = maker ? maker.make(context) : null
			slot.updateTemplateOnly(template)

			if (template) {
				template.update(values!)
				template.afterConnectCallback(PartCallbackParameter.HappenInCurrentContext | PartCallbackParameter.DirectNodeToMove)
			}
		}
	
		return {
			update(p: Promise<any>, vs: any[]) {
				values = vs

				if (p !== promise) {
					updateIndex(0)
					
					p.then(function() {
						updateIndex(1)
					})
					.catch(function() {
						updateIndex(2)
					})

					promise = p
				}
			}
		}
	}
}