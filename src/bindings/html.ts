import {Binding, defineNamedBinding} from './define'


/**
 * `:html` binding will update `innerHTML` of current element.
 * This binding will not validate html content, so be creaful html content may be unsafe.
 * - `:html=${UnsafeHTMLCodes}`
 */
export class HTMLBinding implements Binding {

	private readonly el: HTMLElement

	constructor(el: Element) {
		this.el = el as HTMLElement
	}

	update(value: string) {
		this.el.innerHTML = value === null || value === undefined ? '' :  String(value)
	}

	remove() {}
}

defineNamedBinding('html', HTMLBinding)