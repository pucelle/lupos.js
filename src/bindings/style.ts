import {Binding} from './types'


/**
 * `:style` binding will add style values to target element.
 * - `:style="normalStyleProperties"` - Just like normal style properties.
 * - `:style.style-name=${value}` - Set style `style-name: value`.
 * - `:style.style-name.px=${numberValue}` - Set style `style-name: numberValue + px`. Support by compiler.
 * - `:style.style-name.percent=${numberValue}` - Set style `style-name: numberValue + %`. Support by compiler.
 * - `:style.style-name.url=${numberValue}` - Set style `style-name: url(numberValue)`. Support by compiler.
 * - `:style=${{styleName1: value1, styleName2: value2}}` - Set multiple styles from an object of properties and values.
 * 
 * Note: compiler may replace this binding to equivalent codes.
 */
export class StyleBinding implements Binding {

	private readonly el: HTMLElement | SVGElement
	private lastStyleValues: Record<string, string> = {}

	/** Modifiers like `px`, `percent`, `url` was replaced by compiler. */
	constructor(el: Element) {
		this.el = el as HTMLElement | SVGElement
	}

	update(value: string | Record<string, string>) {
		if (typeof value === 'string') {
			this.updateString(value)
		}
		else if (value && typeof value === 'object') {
			this.updateObject(value)
		}
	}

	/** 
	 * For compiling from:
	 * - `:style="abc"`.
	 * - `:style=${value}` and `value` is inferred as object type.
	 */
	updateString(value: string) {
		let o = this.parseStyleString(value)
		this.updateObject(o)
	}

	/** Parse style string to object. */
	private parseStyleString(value: string) {
		let o: Record<string, string> = {}

		for (let item of value.split(/\s*;\s*/)) {
			let [k, v] = item.split(/\s*:\s*/);
			o[k] = v
		}

		return o
	}

	/** 
	 * For compiling from:
	 * - `:style.style-name=${booleanLike}`.
	 * - `:style=${value}` and `value` is inferred as array type.
	 */
	updateObject(value: Record<string, string>) {
		for (let k of Object.keys(this.lastStyleValues)) {
			if (!value.hasOwnProperty(k)) {
				this.el.style.setProperty(k, '')
			}
		}

		for (let [k, v] of Object.entries(value)) {
			this.el.style.setProperty(k, v)
		}

		this.lastStyleValues = value
	}
}
