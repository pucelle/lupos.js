import {Component} from '../component'
import {Part, PartCallbackParameterMask} from '../types'
import {Binding} from './types'


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

	afterConnectCallback(param: PartCallbackParameterMask) {
		if (!(param & PartCallbackParameterMask.HappenInCurrentContext)) {
			return
		}

		let com = Component.fromClosest(this.el.parentElement!)
		if (com) {
			this.com = com
			com.__setSlotElement(this.slotName!, this.el)
		}
	}

	beforeDisconnectCallback(param: PartCallbackParameterMask) {
		if (!(param & PartCallbackParameterMask.HappenInCurrentContext)) {
			return
		}

		if (this.com) {
			this.com.__setSlotElement(this.slotName!, null)
			this.com = null
		}
	}
}
