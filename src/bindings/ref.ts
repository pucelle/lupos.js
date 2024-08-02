import {Component} from '../component'
import {Part, PartCallbackParameter} from '../types'
import {Binding} from './types'


/**
 * To reference target component or element as a property of current component.
 * - `<el :ref=${this.prop}>`- Reference target element as a property of current component.
 * - `<com :ref=${this.prop}>`- Reference target component as a property of current component.
 * - `<com :ref.el=${this.prop}>`- Reference element of target component as a property of current component.
 */
export class RefBinding implements Binding, Part {

	private readonly el: Element
	
	/** Whether reference only element, not component. */
	private refAsElement: boolean = false

	private refFn: ((value: any) => void) | null = null

	/** Modifier `el` will be replaced by compiler. */
	constructor(el: Element, _context: any, modifiers: string[]) {
		this.el = el
		this.refAsElement = modifiers.includes('el')
	}

	update(refFn: (value: Component | Element | null) => void) {
		this.refFn = refFn
	}

	private doReference() {
		if (this.refAsElement) {
			this.refFn!(this.el)
		}
		else {
			let com = Component.from(this.el)
			if (com) {
				this.refFn!(com)
			}
			else {
				this.refFn!(this.el)
			}
		}
	}

	afterConnectCallback(param: number) {
		if (!(param & PartCallbackParameter.HappenInCurrentContext)) {
			return
		}

		if (this.refFn) {
			this.doReference()
		}
	}

	beforeDisconnectCallback(param: number) {
		if (!(param & PartCallbackParameter.HappenInCurrentContext)) {
			return
		}

		if (this.refFn) {
			this.refFn(null)
		}
	}
}
