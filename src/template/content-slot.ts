import {ContentPosition, ContentPositionType, ContentStartOuterPositionType} from './content-position'
import {Template} from './template'
import {CompiledTemplateResult} from './template-result-compiled'


/** Contents that can be included in a `<tag>${...}<.tag>`. */
export enum SlotContentType {
	Template,
	TemplateArray,
	Node,
	Text,
}


/** To update content that was included in a `>${...}<`. */
export class ContentSlot {

	/** Start outer position, indicate where to put content. */
	private readonly startOuterPosition: ContentPosition<ContentStartOuterPositionType>

	private context: any
	private contentType: SlotContentType | null = null
	private content: Template | Template[] | ChildNode | Text | null = null

	constructor(startOuterPosition: ContentPosition<ContentStartOuterPositionType>, context: any, knownType: SlotContentType | null = null) {
		this.startOuterPosition = startOuterPosition
		this.context = context
		this.contentType = knownType
	}

	/** Replace context after initialized. */
	replaceContext(context: any) {
		this.content = context
	}

	/** 
	 * Try to get parent element.
	 * Can get only when have a slibing slot in the start position,
	 * which means: either `getLastNodeClosest()` or `getParentElement()` must exist.
	 */
	tryGetParentElement(): Element | null {
		let node = this.getLastNodeClosest()
		if (node) {
			return node.parentElement
		}
		
		if (this.startOuterPosition.type === ContentPositionType.AfterSlot) {
			return (this.startOuterPosition.target as ContentSlot).tryGetParentElement()
		}
		else {
			return null
		}
	}

	/** Get last node of the all the contents that inside of current slot. */
	getLastNode(): ChildNode | null {
		if (this.contentType === SlotContentType.Template) {
			return (this.content as Template).getLastNode()
		}
		else if (this.contentType === SlotContentType.TemplateArray) {
			if ((this.content as Template[]).length > 0) {
				let len = (this.content as Template[]).length
				for (let i = len - 1; i >= 0; i--) {
					let node = (this.content as Template[])[i].getLastNode()
					if (node) {
						return node
					}
				}
			}

			return null
		}
		else {
			return this.content as Text | null
		}
	}

	/** 
	 * Try to get last node inside, if miss,
	 * try to find next node exactly before current slot.
	 */
	getLastNodeClosest(): ChildNode | null {
		let node = this.getLastNode()
		if (node) {
			return node
		}

		if (this.startOuterPosition.type === ContentPositionType.After) {
			return node
		}
		else if (this.startOuterPosition.type === ContentPositionType.AfterSlot) {
			return (this.startOuterPosition.target as ContentSlot).getLastNodeClosest()
		}
		else {
			return null
		}
	}

	update(value: unknown) {
		let newContentType = this.recognizeContentType(value)

		if (newContentType !== this.contentType && this.contentType !== null) {
			this.clearOldContent()
		}

		this.contentType = newContentType

		if (newContentType === SlotContentType.Template) {
			this.updateTemplate(value as CompiledTemplateResult)
		}
		else if (newContentType === SlotContentType.TemplateArray) {
			this.updateTemplateArray(value as CompiledTemplateResult[])
		}
		else if (newContentType === SlotContentType.Node) {
			this.updateNode(value as ChildNode)
		}
		else if (newContentType === SlotContentType.Text) {
			this.updateText(value)
		}
	}

	private recognizeContentType(value: unknown): SlotContentType {
		if (value instanceof CompiledTemplateResult) {
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
		if (!this.content) {
			return
		}

		if (this.contentType === SlotContentType.Template) {
			(this.content as Template).remove()
		}
		else if (this.contentType === SlotContentType.TemplateArray) {
			let ts = this.content as Template[]

			for (let i = 0; i < ts.length; i++) {
				let t = ts[i]
				t.remove()
			}
		}

		let lastNode = (this.content as Template).getLastNode()
		if (lastNode) {
			for (let node of this.startOuterPosition.walkNodesUntil(lastNode)) {
				node.remove()
			}
		}

		this.content = null
	}

	updateTemplate(tr: CompiledTemplateResult) {
		let oldT = this.content as Template | null
		if (oldT && oldT.maker === tr.maker) {
			oldT.update(tr.values)
		}
		else {
			if (oldT) {
				this.removeTemplate(oldT, null)
			}

			let newT = tr.maker.make(this.context)
			newT.update(tr.values)

			this.startOuterPosition.insertAfter(...newT.walkNodes())
			this.content = newT
		}
	}

	updateTemplateArray(trs: CompiledTemplateResult[]) {
		let oldTs = this.content as Template[] | null
		if (!oldTs) {
			oldTs = this.content = []
		}

		// Update shared part.
		for (let i = 0; i < trs.length; i++) {
			let oldT = i < oldTs.length ? oldTs[i] : null
			let tr = trs[i]

			if (oldT && oldT.maker === tr.maker) {
				oldT.update(tr.values)
			}
			else {
				let newT = tr.maker.make(this.context)
				let nextOldT = i + 1 < oldTs.length ? oldTs[i + 1] : null

				if (oldT) {
					this.removeTemplate(oldT, nextOldT)
				}
				
				newT.update(tr.values)
				this.insertTemplate(newT, nextOldT)

				oldTs[i] = newT
			}
		}

		// Remove rest part.
		if (trs.length < oldTs.length) {
			for (let i = trs.length; i < oldTs.length; i++) {
				let oldT = oldTs[i]
				let nextOldT = i + 1 < oldTs.length ? oldTs[i + 1] : null

				this.removeTemplate(oldT, nextOldT)
			}
		}
	}

	private removeTemplate(t: Template, previousT: Template | null) {
		t.remove()

		let lastNode = t.getLastNode()
		if (!lastNode) {
			return
		}

		let position = previousT ? previousT.endInnerPosition : this.startOuterPosition
		for (let node of position.walkNodesUntil(lastNode)) {
			node.remove()
		}
	}

	private insertTemplate(t: Template, previousT: Template | null) {
		let position = previousT ? previousT.endInnerPosition : this.startOuterPosition
		position.insertAfter(...t.walkNodes())
	}

	updateNode(node: ChildNode) {
		let currNode = this.content as ChildNode | null

		if (node !== currNode) {
			if (currNode) {
				currNode.remove()
			}

			this.startOuterPosition.insertAfter(node)
			this.content = node
		}
	}

	updateText(value: unknown) {
		let node = this.content as Text | null
		let text = value === null || value === undefined ? '' : String(value).trim()

		if (text) {
			if (node) {
				node.textContent = text
			}
			else {
				node = document.createTextNode(text)
				this.startOuterPosition.insertAfter(node)
				this.content = node
			}
		}
		else {
			if (node) {
				node.textContent = ''
			}
		}
	}
}