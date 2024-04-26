import {HTMLUtils, DateUtils} from '@pucelle/ff'
import {Binding, defineNamedBinding} from './define'


/**
 * `:html` binding will update `innerHTML` property of current element
 * to processed to become safe html codes.
 * - `:html=${HTMLCodes}`
 */
export class HTMLBinding implements Binding {

	private readonly el: HTMLElement

	constructor(el: Element) {
		this.el = el as HTMLElement
		console.log(DateUtils.getDaysOfYear(new Date()))
	}

	update(value: string | number | null | undefined) {
		this.el.innerHTML = value === null || value === undefined ? ''
			: HTMLUtils.cleanUnsafeHTML(String(value))
	}
}

defineNamedBinding('html', HTMLBinding)