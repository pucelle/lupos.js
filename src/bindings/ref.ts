import {Component} from '../component'
import {Binding, defineNamedBinding} from './define'


/**
 * To reference target component or element as a property of current component.
 * - `<el :ref=${this.prop}>`- Reference target element as a property of current component.
 * - `<com :ref=${this.prop}>`- Reference target component as a property of current component.
 * - `<com :ref.el=${this.prop}>`- Reference element of target component as a property of current component.
 */
export class RefBinding implements Binding {

	private readonly el: Element

	constructor(el: Element) {
		this.el = el
	}

	update(refFn: (value: Component | Element) => void) {
		let com = Component.from(this.el)
		if (com) {
			refFn(com)
		}
		else {
			refFn(this.el)
		}
	}

	/** If compiler knows that will reference a component. */
	updateComponent(refFn: (value: Component) => void) {
		let com = Component.from(this.el)!
		refFn(com)
	}

	/** If compiler knows that will reference an element. */
	updateElement(refFn: (value: Element) => void) {
		refFn(this.el)
	}

	remove() {}
}

defineNamedBinding('ref', RefBinding)