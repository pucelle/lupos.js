import {Component} from '../component'
import {Part, PartCallbackParameter} from '../types'
import {Binding, defineNamedBinding} from './define'


/**
 * `:slot` binding reference current element as one of `slotElements` sub property,
 * and later insert it into same named `<slot>` of closest component.
 * 
 * Note: compiler may replace this binding to equivalent codes.
 */
export class SlotBinding implements Binding, Part {

	private readonly el: Element
	private com: Component | null = null
	private slotName: string | null = null

	constructor(el: Element) {
		this.el = el
	}

	update(slotName: string) {
		let com = Component.fromClosest(this.el)
		if (com) {
			this.updateComSlot(slotName, com!)
		}
	}

	/** For compiler knows about closest component. */
	updateComSlot(slotName: string, com: Component) {
		this.slotName = slotName
		this.com = com
		com.__applySlotElement(slotName, this.el)
	}

	afterConnectCallback(param: number) {
		if (this.com && param & PartCallbackParameter.HappenInCurrentContext) {
			this.com.__applySlotElement(this.slotName!, this.el)
		}
	}

	// Bad part is this will also execute when whole context is disconnected,
	// Which is not we want.
	async beforeDisconnectCallback(param: number) {
		if (this.com && param & PartCallbackParameter.HappenInCurrentContext) {
			this.com.__applySlotElement(this.slotName!, null)
		}
	}
}

defineNamedBinding('slot', SlotBinding)