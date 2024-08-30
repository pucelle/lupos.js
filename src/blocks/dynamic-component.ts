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
	readonly slot: TemplateSlot
	readonly contentRange: SlotRange | null

	private Com: ComponentConstructor | null = null
	private com: Component | null = null

	constructor(binder: DynamicComponentBinder, slot: TemplateSlot, contentRange: SlotRange | null = null) {
		this.binder = binder
		this.slot = slot
		this.contentRange = contentRange
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
		else if (this.contentRange) {
			com.__applyRestSlotRange(this.contentRange)
		}

		let template = makeTemplateByComponent(com)
		this.slot.updateTemplateOnly(template, null)

		this.Com = NewCom
		this.com = com
	}
}
