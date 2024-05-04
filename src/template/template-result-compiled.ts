import {TemplateMaker} from './template-maker'


/** 
 * Compile from html`...`,
 * it only caches compiled template maker and some newly generated values.
 */
export class CompiledTemplateResult {

	maker: TemplateMaker
	values: any[]

	constructor(maker: TemplateMaker, values: any[]) {
		this.maker = maker
		this.values = values
	}
}
