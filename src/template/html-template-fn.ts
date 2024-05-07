/** 
 * Create a template fn from inner html string.
 * Call the returned function to get a template element containing the html content.
 */
export function createHTMLTemplateFn(html: string): () => HTMLTemplateElement {
	let el: HTMLTemplateElement | null = null

	return function() {
		if (!el) {
			el = document.createElement('template')

			if (html) {
				el.innerHTML = html
			}
		}
	
		return el.cloneNode(true) as HTMLTemplateElement
	}
}