import {Component, ComponentConstructor} from '../component'
import {SlotRange, TemplateSlot} from '../template'
import {makeComponentTemplate} from '../template/template-makers'


/** 
 * After compiling all the properties applied to a component,
 * get this binder as a function.
 */
type DynamicComponentBinder = (com: Component) => void


/** 
 * Compiled by:
 * ```
 * 	<${DynamicComponent} ...>
 * ```
 */
export class DynamicComponentBlock {

	readonly binder: DynamicComponentBinder
	readonly slot: TemplateSlot<null>
	readonly contentRange: SlotRange
	readonly context: any

	private Com: ComponentConstructor | null = null

	constructor(binder: DynamicComponentBinder, slot: TemplateSlot<null>, contentRange: SlotRange, context: any) {
		this.binder = binder
		this.slot = slot
		this.contentRange = contentRange
		this.context = context
	}

	/** Update with new Component Constructor. */
	update(NewCom: ComponentConstructor) {
		if (NewCom === this.Com) {
			return
		}

		let com = new NewCom()
		this.binder(com)

		com.el.prepend(...this.contentRange.walkNodes())
		com.__applyRestSlotRange(this.contentRange)

		let template = makeComponentTemplate(com)
		this.slot.updateTemplateOnly(template, null)

		this.Com = NewCom
	}
}
