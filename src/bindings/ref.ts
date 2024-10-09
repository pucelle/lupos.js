import {Component} from '../component'
import {Part, PartCallbackParameterMask} from '../part'
import {Binding} from './types'


/**
 * To reference target component or element as a property of current component.
 * - `<el :ref=${this.prop}>`- Reference target element as a property of current component.
 * - `<Com :ref=${this.prop}>`- Reference target component as a property of current component.
 * - `<Com :ref.el=${this.prop}>`- Reference element of target component as a property of current component.
 * - `<XXX :ref.binding=${this.prop}>`- Reference previous binding `:binding=...`.
 */
export class RefBinding implements Binding, Part {

	private readonly el: Element
	private readonly context: any

	/** Whether reference only element, not component. */
	private refAsElement: boolean = false
	
	/** Compiler will compile `this.prop` -> `r => this.prop = r` */
	private refFn: ((value: any) => void) | null = null

	constructor(el: Element, context: any, modifiers: ('el'|'binding')[] = []) {
		this.el = el
		this.context = context
		this.refAsElement = modifiers.includes('el')
	}

	update(refFn: (value: Component | Element | null) => void) {
		this.refFn = refFn
	}

	private doReference() {
		if (this.refAsElement) {
			this.refFn!.call(this.context, this.el)
		}
		else {
			let com = Component.from(this.el)
			if (com) {
				this.refFn!.call(this.context, com)
			}
			else {
				this.refFn!.call(this.context, this.el)
			}
		}
	}

	afterConnectCallback(param: PartCallbackParameterMask | 0) {
		if ((param & PartCallbackParameterMask.HappenInCurrentContext) === 0) {
			return
		}

		if (this.refFn) {
			this.doReference()
		}
	}

	beforeDisconnectCallback(param: PartCallbackParameterMask | 0) {
		if ((param & PartCallbackParameterMask.HappenInCurrentContext) === 0) {
			return
		}

		if (this.refFn) {
			this.refFn.call(this.context, null)
		}
	}
}
