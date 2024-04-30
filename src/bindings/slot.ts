import {Component} from '../component'
import {Part, PartCallbackParameter} from '../types'
import {Binding, defineNamedBinding} from './define'


/**
 * `:slot` binding reference current element as one of `slotElements` sub property,
 * and later insert it into same named `<slot>` of closest component.
 * - `<el :slot="slotName">`
 * 
 * Note: compiler may replace this binding to equivalent codes.
 */
export class SlotBinding implements Binding, Part {

	private readonly el: Element
	private slotName: string | null = null
	private com: Component | null = null

	constructor(el: Element) {
		this.el = el
	}

	update(slotName: string) {
		this.slotName = slotName
	}

	/** For compiler knows about closest component. */
	updateCom(com: Component) {
		this.com = com
	}

	afterConnectCallback(param: number) {
		let com = Component.fromClosest(this.el)
		if (com) {
			this.updateCom(com)
		}

		if (com && param & PartCallbackParameter.HappenInCurrentContext) {
			com.__applySlotElement(this.slotName!, this.el)
		}
	}

	async beforeDisconnectCallback(param: number) {
		if (this.com && param & PartCallbackParameter.HappenInCurrentContext) {
			this.com.__applySlotElement(this.slotName!, null)
		}
	}
}

defineNamedBinding('slot', SlotBinding)