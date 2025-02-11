import {Component} from '../component'
import {Part, PartCallbackParameterMask} from '../part'
import {Binding} from './types'


/**
 * `:slot` binding reference current element as one of `slotElements` sub property,
 * and later insert it into same named `<slot>` of closest component.
 * - `<el :slot="slotName">`
 * 
 * Note: compiler may replace this binding to equivalent codes.
 * 
 * Passing a html`...` as parameter would do same
 * thing like a slot interpolation do,
 * but if you want to toggle dynamic component,
 * and don't want re-render embedded content,
 * Use slot interpolation would be better.
 * 
 * Otherwise, you may also pre-render a node,
 * or a component-like by `render(...)` and pass it's `el`
 * as `${referencedNode}` to template to re-use it.
 */
export class SlotBinding implements Binding, Part {

	private readonly el: Element
	private slotName: string | null = null
	private com: Component | null = null
	private connected: boolean = false

	constructor(el: Element) {
		this.el = el
	}

	update(slotName: string) {
		this.slotName = slotName
	}

	afterConnectCallback(_param: PartCallbackParameterMask | 0) {
		if (this.connected) {
			return
		}

		let com = Component.fromClosest(this.el.parentElement!)
		if (com) {
			this.com = com
			com.__setSlotElement(this.slotName!, this.el)
		}
	}

	beforeDisconnectCallback(param: PartCallbackParameterMask | 0) {
		if ((param & PartCallbackParameterMask.MoveFromOwnStateChange) === 0) {
			return
		}

		if (this.com) {
			this.com.__setSlotElement(this.slotName!, null)
			this.com = null
		}

		this.connected = false
	}
}
