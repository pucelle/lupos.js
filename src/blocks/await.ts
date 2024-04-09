import {Template, TemplateMaker, TemplateSlot} from '../template'


/** Type of compiling statements like `<await>...`. */
export type AwaitBlockStatement = (slot: TemplateSlot, context: any) => (promise: Promise<any>, values: any[]) => void


/** 
 * Make it by compiling:
 * ```
 * 	<await ${...}>...</await>
 * 	<then>...</then>
 * 	<catch>...</catch>
 * ```
 */
export function make_await_statement(makers: (TemplateMaker | null)[]): AwaitBlockStatement {
	return function(slot: TemplateSlot, context: any) {
		let promise: Promise<any> | null = null
		let values: any[] | null = null
		let template: Template | null = null

		function updateIndex(index: number) {
			let maker = makers[index]
			template = maker ? maker.make(context) : null
			slot.updateTemplate(template)
		}
	
		return function(p: Promise<any>, vs: any[]) {
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