/** All template types. */
export type TemplateType = 'html' | 'css' | 'svg'


/** 
 * Returns a HTML template literal, can be used to render or update a component.
 * Uses it like:
 * 
 * ```ts
 * html`...`
 * ```
 * 
 * It will be replaced to a `TemplateCompiled` object after compiled by `@pucelle/lupos-compiler`.
 */
export function html(strings: TemplateStringsArray, ...values: any[]): TemplateResult {
	return new TemplateResult('html', strings, values)
}


/** 
 * Returns a SVG template literal, can be used to render or update a component.
 * Uses it like:
 * 
 * ```ts
 * svg`...`
 * ```
 * 
 * It will be replaced to a `TemplateCompiled` object after compiled by `@pucelle/lupos-compiler`.
 */
export function svg(strings: TemplateStringsArray, ...values: any[]): TemplateResult {
	return new TemplateResult('svg', strings, values)
}


/** 
 * Returns a CSS template literal, can be used as component's `static style` property.
 * Uses it like:
 * 
 * ```ts
 * css`...`
 * ```
 */
export function css(strings: TemplateStringsArray, ...values: any[]): TemplateResult {
	return new TemplateResult('css', strings, values)
}


/**
 * Created from each html`...` or svg`...`.
 * Every time call `component.update` will generate a new template result,
 * then we will use this result to patch or replaced old one.
 */
export class TemplateResult {

	/** Joins several templates with a spliter to one template result. */
	static join(results: TemplateResult[], spliter: string | TemplateResult) {
		let strings: string[] = []
		let values: any[] = []

		for (let i = 0; i < results.length; i++) {
			let result = results[i]

			// Not first.
			if (i > 0) {
				strings[strings.length - 1] += result.strings[0]
				strings.push(...result.strings.slice(1))
			}
			else {
				strings.push(...result.strings)
			}
			
			values.push(...result.values)

			if (spliter instanceof TemplateResult) {
				// Not last.
				if (i < results.length - 1 && spliter) {
					strings[strings.length - 1] += spliter.strings[0]
					strings.push(...spliter.strings.slice(1))
					values.push(...spliter.values)
				}
			}
			else {
				// Not last.
				if (i < results.length - 1 && spliter) {
					strings[strings.length - 1] += spliter
				}
			}
		}

		return new TemplateResult(results[0].type, strings, values)
	}

	readonly type: TemplateType
	readonly strings: TemplateStringsArray | string[]
	readonly values: any[]

	constructor(type: TemplateType, strings: TemplateStringsArray | string[], values: any[]) {
		this.type = type
		this.strings = strings
		this.values = values
	}

	/** 
	 * Join strings and values to string.
	 * Just for debugging.
	 */
	toString(): string {
		let text = this.strings[0]

		for (let i = 0; i < this.strings.length - 1; i++) {
			let value = this.values[i]

			if (value !== null && value !== undefined) {
				if (Array.isArray(value)) {
					text += value.join('')
				}
				else {
					text += String(value)
				}
			}

			text += this.strings[i + 1]
		}

		return text
	}

	/** Clone current template result and returns a new one. */
	clone(): TemplateResult {
		return new TemplateResult(this.type, [...this.strings], [...this.values])
	}

	/** Concat with another template result, and returns a new one. */
	concat(...results: TemplateResult[]): TemplateResult {
		let strings = [...this.strings]
		let values = [...this.values]

		for (let result of results) {
			strings[strings.length - 1] += result.strings[0]
			strings.push(...result.strings.slice(1))
			values.push(...result.values)
		}

		return new TemplateResult(this.type, strings, values)
	}
}
