import {Component, ComponentConstructor} from '../component'
import {SlotRange, TemplateSlot, makeTemplateByComponent} from '../template'


/** 
 * After compiling all the properties applied to a component,
 * and update latest component reference.
 * get this binder as a function.
 */
type DynamicComponentBinder = (com: Component) => void


/** 
 * Compiled by:
 * ```
 * 	<${DynamicComponent}>
 * ```
 */
export class DynamicComponentBlock {

	readonly binder: DynamicComponentBinder
	readonly slot: TemplateSlot<null>
	readonly contentRange: SlotRange | null
	readonly context: any

	private Com: ComponentConstructor | null = null
	private com: Component | null = null

	constructor(binder: DynamicComponentBinder, slot: TemplateSlot<null>, contentRange: SlotRange | null, context: any) {
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

		if (this.com) {
			this.com.__transferSlotContents(com)
		}

		let template = makeTemplateByComponent(com)
		this.slot.updateTemplateOnly(template, null)

		this.Com = NewCom
		this.com = com
	}
}
