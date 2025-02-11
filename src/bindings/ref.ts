import {Component} from '../component'
import {Part, PartCallbackParameterMask} from '../part'
import {Binding} from './types'


enum RefType {
	Element,
	Component,
	Binding,
}


/**
 * To reference target component or element as a property of current component.
 * - `<el :ref=${this.prop}>`- Reference target element as a property of current component.
 * - `<Com :ref=${this.prop}>`- Reference target component as a property of current component.
 * - `<Com :ref.el=${this.prop}>`- Reference element of target component as a property of current component.
 * - `<XXX :ref.binding=${this.prop}>`- Reference previous binding `:binding=...`.
 * - `<XXX :ref=${function(comOrElOrBinding){...}}>`- Reference target element by a ref function, `this` is current context.
 * 
 * Note when referring an optional binding like `?:binding`
 */
export class RefBinding implements Binding, Part {

	private readonly el: Element
	private readonly context: any
	private connected: boolean = false

	/** Whether reference element, or component, or binding. */
	private refType: RefType = RefType.Element
	
	/** Compiler will compile `this.prop` -> `r => this.prop = r` */
	private refFn: ((value: any) => void) | null = null

	constructor(el: Element, context: any, modifiers: ('el' | 'com' | 'binding')[] = []) {
		this.el = el
		this.context = context

		this.refType = modifiers.includes('el')
			? RefType.Element
			: modifiers.includes('com')
			? RefType.Component
			: modifiers.includes('binding')
			? RefType.Binding
			: RefType.Element
	}

	update(refFn: (value: Component | Element | Binding | null) => void) {
		this.refFn = refFn
	}

	private doReference() {
		if (this.refType === RefType.Element) {
			this.refFn!.call(this.context, this.el)
		}
		else if (this.refType === RefType.Component) {
			let com = Component.from(this.el)
			this.refFn!.call(this.context, com)
		}
		else {
			this.refFn!.call(this.context, true)
		}
	}

	afterConnectCallback(_param: PartCallbackParameterMask | 0) {
		if (this.connected) {
			return
		}

		if (this.refFn) {
			this.doReference()
		}

		this.connected = true
	}

	beforeDisconnectCallback(param: PartCallbackParameterMask | 0) {
		if ((param & PartCallbackParameterMask.MoveFromOwnStateChange) === 0) {
			return
		}

		if (this.refFn) {
			this.refFn.call(this.context, this.refType === RefType.Binding ? false : null)
		}

		this.connected = false
	}
}
