import {ContentPosition} from './contant-position'
import {TemplateResult} from './template-result'


/** Contents that can be included in a `<tag>${...}<.tag>`. */
export enum SlotContentType {
	Template,
	TemplateArray,
	Text,
}


/** To update content that was included in a `>${...}<`. */
export class ContentSlot {

	/** Start outer position, indicate where to put content. */
	private startOuterPosition: ContentPosition

	private contentType: SlotContentType | null = null
	private content: TemplateResult | TemplateResult[] | Text | null = null

	constructor(startOuterPosition: ContentPosition, knownType: SlotContentType | null = null) {
		this.startOuterPosition = startOuterPosition
		this.contentType = knownType
	}

	/** Get current content. */
	getContent(): TemplateResult | TemplateResult[] | Text | null {
		return this.content
	}

	/** Get last node of the all the contents in current slot. */
	getLastNode(): Node | null {
		if (this.contentType === SlotContentType.Template) {
			return (this.content as TemplateResult).getLastNode()
		}
		else if (this.contentType === SlotContentType.TemplateArray) {
			if ((this.content as TemplateResult[]).length > 0) {
				let len = (this.content as TemplateResult[]).length
				for (let i = len - 1; i >= 0; i--) {
					let node = (this.content as TemplateResult[])[i].getLastNode()
					if (node) {
						return node
					}
				}
			}
		}
		else {
			return this.content as Text
		}

		return null
	}

	update(value: unknown) {
		let newContentType = this.recognizeContentType(value)

		if (newContentType !== this.contentType && this.contentType !== null) {
			this.clearOldContent()
		}

		this.contentType = newContentType

		switch (newContentType) {
			case SlotContentType.Template:
				this.updateTemplate(value as TemplateResult)
				break

			case SlotContentType.TemplateArray:
				this.updateTemplateArray(value as TemplateResult[])
				break

			case SlotContentType.Text:
				this.updateText(value)
		}
	}

	private recognizeContentType(value: unknown): SlotContentType {
		if (value instanceof TemplateResult) {
			return SlotContentType.Template
		}
		else if (Array.isArray(value)) {
			return SlotContentType.TemplateArray
		}
		else {
			return SlotContentType.Text
		}
	}

	private clearOldContent() {
		let contentType = this.contentType

		if (contentType === SlotContentType.Template) {
			(this.content as TemplateResult).remove()
		}
		else if (contentType === SlotContentType.TemplateArray) {
			for (let template of this.content as TemplateResult[]) {
				template.remove()
			}
		}
		else if (contentType === SlotContentType.Text) {
			if (this.content) {
				(this.content as Text).remove()
			}
		}

		this.content = null
	}

	updateTemplate(result: TemplateResult) {
		// One issue when reusing old template - image will keep old appearance until the new image loaded.
		// We can partly fix this by implementing a binding API `:src`.

		let oldTemplate = this.content as Template | null
		if (oldTemplate && oldTemplate.canPatchBy(result)) {
			oldTemplate.patch(result)
		}
		else {
			if (oldTemplate) {
				oldTemplate.remove()
			}

			let newTemplate = new Template(result, this.context)
			this.anchor.insert(newTemplate.extractToFragment())
			this.content = newTemplate
		}
	}

	updateTemplateArray(results: TemplateResult[]) {
		let templates = this.content as Template[] | null
		if (!templates) {
			templates = this.content = []
		}

		results = results.filter(result => result instanceof TemplateResult)

		// Updates shared part.
		for (let i = 0; i < results.length; i++) {
			let oldTemplate = i < templates.length ? templates[i] : null
			let result = results[i]

			if (oldTemplate?.canPatchBy(result)) {
				oldTemplate.patch(result)
			}
			else {
				let newTemplate = new Template(result, this.context)

				if (oldTemplate) {
					oldTemplate.replaceWith(newTemplate)
				}
				else {
					this.anchor.insert(newTemplate.extractToFragment())
				}

				templates[i] = newTemplate
			}
		}

		// Removes rest templates.
		if (results.length < templates.length) {
			for (let i = templates.length - 1; i >= results.length; i--) {
				templates.pop()!.remove()
			}
		}
	}

	updateText(value: unknown) {
		let textNode = this.content as Text | null
		let text = value === null || value === undefined ? '' : trim(String(value))

		if (text) {
			if (textNode) {
				textNode.textContent = text
			}
			else {
				textNode = document.createTextNode(text)
				this.anchor.insert(textNode)
				this.content = textNode
			}
		}
		else {
			if (textNode) {
				textNode.textContent = ''
			}
		}
	}
}