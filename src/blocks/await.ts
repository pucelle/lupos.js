import {Template, TemplateMaker, TemplateSlot} from '../template'


/** 
 * Make it by compiling:
 * ```
 * 	<await ${...}>...</await>
 * 	<then>...</then>
 * 	<catch>...</catch>
 * ```
 */
export class AwaitBlockMaker {

	readonly makers: (TemplateMaker | null)[]

	constructor(makers: (TemplateMaker | null)[]) {
		this.makers = makers
	}

	/** Make an `AwaitBlock`. */
	make(slot: TemplateSlot<null>, context: any): AwaitBlock {
		return new AwaitBlock(this.makers, slot, context)
	}
}



/** An `AwaitBlock` help to update an `<await>...<then>...<catch>` block. */
export class AwaitBlock {

	readonly makers: (TemplateMaker | null)[]
	readonly slot: TemplateSlot<null>
	readonly context: any

	private promise: Promise<any> | null = null
	private values: any[] | null = null
	private template: Template | null = null

	constructor(makers: (TemplateMaker | null)[], slot: TemplateSlot<null>, context: any) {
		this.makers = makers
		this.slot = slot
		this.context = context
	}

	/** 
	 * Note update await block or resolve awaiting promise must wait
	 * for a micro task tick, then template will begin to update.
	 */
	update(promise: Promise<any>, values: any[]) {
		this.values = values

		if (promise !== this.promise) {
			this.updateIndex(0)
			
			promise.then(() => {
				this.updateIndex(1)
			})
			.catch(() => {
				this.updateIndex(2)
			})

			this.promise = promise
		}
	}
	
	private updateIndex(index: number) {
		let maker = this.makers[index]
		this.template = maker ? maker.make(this.context) : null
		this.slot.updateTemplateOnly(this.template, this.values!)
	}
}
