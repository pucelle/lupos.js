import {Component, ComponentConstructor} from '../component'
import {SlotRange, TemplateSlot} from '../template'
import {makeComponentTemplate} from '../template/template-makers'


/** 
 * After compiling all the properties applied to a component,
 * get this binder as a function.
 */
type DynamicComponentBinder = (com: Component, context: any) => {
	update(values: any[]): void
}


/** 
 * Make it by compiling:
 * ```
 * 	<${DynamicComponent} ...>
 * ```
 */
export class DynamicComponentBlockMaker {

	readonly binder: DynamicComponentBinder

	constructor(bindFn: DynamicComponentBinder) {
		this.binder = bindFn
	}

	/** Update with new Component Constructor. */
	make(slot: TemplateSlot<null>, contentRange: SlotRange, context: any): DynamicComponentBlock {
		return new DynamicComponentBlock(this.binder, slot, contentRange, context)
	}
}


/** Help to update a dynamic component. */
export class DynamicComponentBlock {

	readonly binder: DynamicComponentBinder
	readonly slot: TemplateSlot<null>
	readonly contentRange: SlotRange
	readonly context: any

	private Com: ComponentConstructor | null = null
	private bindUpdater: ReturnType<DynamicComponentBinder> | null = null

	constructor(binder: DynamicComponentBinder, slot: TemplateSlot<null>, contentRange: SlotRange, context: any) {
		this.binder = binder
		this.slot = slot
		this.contentRange = contentRange
		this.context = context
	}

	/** Update with new Component Constructor. */
	update(NewCom: ComponentConstructor, values: any[]) {
		if (NewCom !== this.Com) {
			let com = new NewCom()
			this.bindUpdater = this.binder(com, this.context)

			com.el.prepend(...this.contentRange.walkNodes())
			com.__applyRestSlotRange(this.contentRange)

			let template = makeComponentTemplate(com)
			this.slot.updateTemplateOnly(template, null)

			this.Com = NewCom
		}

		this.bindUpdater!.update(values)
	}
}
