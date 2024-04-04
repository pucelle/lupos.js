import {TemplateMaker} from './template-maker'


/** Compile from html`...`. */
export class CompiledTemplateResult {

	maker: TemplateMaker
	values: any[]

	constructor(maker: TemplateMaker, values: any[]) {
		this.maker = maker
		this.values = values
	}
}
