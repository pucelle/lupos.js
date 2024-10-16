import {TemplateMaker} from './template-maker'


/** 
 * Compile from html`...`,
 * it only caches compiled template maker and newly generated values.
 */
export class CompiledTemplateResult {

	readonly maker: TemplateMaker
	readonly values: any[]

	constructor(maker: TemplateMaker, values: any[]) {
		this.maker = maker
		this.values = values
	}

	toString() {
		throw new Error(`Can't use "toString()" after "TemplateResult" compiled!`)
	}
}
