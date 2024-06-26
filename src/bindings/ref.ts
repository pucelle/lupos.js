import {Component} from '../component'
import {Part, PartCallbackParameter} from '../types'
import {Binding, defineNamedBinding} from './define'


/**
 * To reference target component or element as a property of current component.
 * - `<el :ref=${this.prop}>`- Reference target element as a property of current component.
 * - `<com :ref=${this.prop}>`- Reference target component as a property of current component.
 * - `<com :ref.el=${this.prop}>`- Reference element of target component as a property of current component.
 */
export class RefBinding implements Binding, Part {

	private readonly el: Element
	
	/** 
	 * Whether reference only element, not component.
	 * For `:ref.el`, compiler will set this property to `true`.
	 */
	refElement: boolean = false

	private refFn: ((value: any) => void) | null = null

	/** Modifier `el` will be replaced by compiler. */
	constructor(el: Element) {
		this.el = el
	}

	update(refFn: (value: Component | Element | null) => void) {
		this.refFn = refFn
	}

	private doReference() {
		if (this.refElement) {
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

defineNamedBinding('ref', RefBinding)