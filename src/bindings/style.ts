import {Binding, defineNamedBinding} from './define'


/** Type of style object. */
type StyleObject = Record<string, string>


/**
 * `:style` binding will add style values to target element.
 * - `:style="normalStyleProperties"` - Just like normal style properties.
 * - `:style.style-name=${value}` - Set style `style-name: value`.
 * - `:style.style-name.px=${numberValue}` - Set style `style-name: numberValue + px`. Support by compiler.
 * - `:style.style-name.percent=${numberValue}` - Set style `style-name: numberValue + %`. Support by compiler.
 * - `:style.style-name.url=${numberValue}` - Set style `style-name: url(numberValue)`. Support by compiler.
 * - `:style=${{styleName1: value1, styleName2: value2}}` - Set multiple styles from an object of properties and values.
 */
export class StyleBinding implements Binding {

	private readonly el: HTMLElement | SVGElement

	constructor(el: Element) {
		this.el = el as HTMLElement | SVGElement
	}

	update(value: string | StyleObject) {
		if (typeof value === 'string') {
			this.updateString(value)
		}
		else if (value && typeof value === 'object') {
			this.updateObject(value)
		}
	}

	updateString(value: string) {
		this.el.style.cssText = value
	}

	updateObject(value: StyleObject) {
		for (let [k, v] of Object.entries(value)) {
			(this.el.style as any)[k] = v
		}
	}

	remove() {}
}

defineNamedBinding('style', StyleBinding)