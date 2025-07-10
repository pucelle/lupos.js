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
			: cleanUnsafeHTML(String(value))
	}
}


/** Clean all unsafe html tags and events, like `<script>`, `onerror=...` */
function cleanUnsafeHTML(html: string): string {
	return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script\s*>/gi, '')
	.replace(/<\w+[\s\S]*?>/g, function(m0: string) {
		return m0.replace(/\s*on\w+\s*=\s*(['"])?.*?\1/g, '')
	})
}