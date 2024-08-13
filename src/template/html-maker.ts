/** 
 * Create a template maker from inner html string.
 * Call the returned function to get a template element containing the html content.
 */
export class HTMLMaker {

	private html: string
	private wrapped: boolean
	private node: HTMLTemplateElement | null = null

	constructor(html: string, wrapped: boolean = false) {
		this.html = html
		this.wrapped = wrapped
	}

	make(): HTMLTemplateElement {
		if (!this.node) {
			this.node = document.createElement('template')
			this.node.innerHTML = this.html

			// Remove wrapped container.
			if (this.wrapped) {
				let container = this.node.content.firstElementChild!
				container.replaceWith(...container.childNodes)
			}
		}
	
		return this.node.cloneNode(true) as HTMLTemplateElement
	}
}