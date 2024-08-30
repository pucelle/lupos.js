import {HTMLUtils} from '@pucelle/ff'
import {Binding} from './types'


/**
 * `:html` binding will update `innerHTML` property of current element
 * to processed to become safe html codes.
 * - `:html=${HTMLCodes}`
 */
export class HTMLBinding implements Binding {

	private readonly el: HTMLElement

	constructor(el: Element) {
		this.el = el as HTMLElement
	}

	update(value: string | number | null | undefined) {
		this.el.innerHTML = value === null || value === undefined
			? ''
			: HTMLUtils.cleanUnsafeHTML(String(value))
	}
}
