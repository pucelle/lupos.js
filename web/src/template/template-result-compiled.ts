import {TemplateMaker} from './template-maker'


/** 
 * Compile from html`...`,
 * it only caches compiled template maker and newly generated values.
 */
export class CompiledTemplateResult {

	readonly maker: TemplateMaker
	readonly values: any[]

	/** 
	 * Must bind original context.
	 * E.g., generate by a render function in a list,
	 * and get passed to a repeat component, it will bind  to the repeat.
	 */
	readonly context: any

	constructor(maker: TemplateMaker, values: any[], context: any) {
		this.maker = maker
		this.values = values
		this.context = context
	}

	toString() {
		throw new Error(`Can't use "toString()" after "TemplateResult" compiled!`)
	}
}
