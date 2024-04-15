import {TemplateSlotPosition, SlotPositionType, SlotEndOuterPositionType} from './template-slot-position'
import {Template} from './template'
import {CompiledTemplateResult} from './template-result-compiled'


/** Contents that can be included in a `<tag>${...}<.tag>`. */
export enum SlotContentType {
	TemplateResult,
	TemplateResultArray,
	Text,
}


/** 
 * A `TemplateSlot` indicates a `>${...}<` inside a template,
 * helps to update content of the slot.
 */
export class TemplateSlot implements Part {

	/** End outer position, indicate where to put content. */
	readonly endOuterPosition: TemplateSlotPosition<SlotEndOuterPositionType>

	private context: any
	private contentType: SlotContentType | null = null
	private content: Template | Template[] | ChildNode | Text | null = null

	constructor(endOuterPosition: TemplateSlotPosition<SlotEndOuterPositionType>, context: any, knownType: SlotContentType | null = null) {
		this.endOuterPosition = endOuterPosition
		this.context = context
		this.contentType = knownType
	}

	afterConnectCallback(directly: 0 | 1) {
		// No need to check whether `endOuterPosition` is `SlotPositionType.AfterContent`.
		// Because when component use this position, `directly` parameter is always be `0`.
		// When a template should use this position, it always be `0`, and add a comment instead.

		if (this.contentType === SlotContentType.TemplateResult) {
			(this.content as Template).afterConnectCallback(directly)
		}
		else if (this.contentType === SlotContentType.TemplateResultArray) {
			for (let t of this.content as Template[]) {
				t.afterConnectCallback(directly)
			}
		}
	}

	async beforeDisconnectCallback(directly: 0 | 1): Promise<void> {
		if (this.contentType === SlotContentType.TemplateResult) {
			return (this.content as Template).beforeDisconnectCallback(directly)
		}
		else if (this.contentType === SlotContentType.TemplateResultArray) {
			let promises: Promise<void>[] = []
			
			for (let t of this.content as Template[]) {
				let p = t.beforeDisconnectCallback(directly)
				if (p) {
					promises.push(p)
				}
			}

			return Promise.all(promises) as Promise<any>
		}
	}

	/** Replace context after initialized. */
	replaceContext(context: any) {
		this.content = context
	}

	/** 
	 * Try to get parent element of current slot.
	 * Result is exist only when have a slibing slot in the start position,
	 * which means: either `getFirstNodeClosest()` or `getParentElement()` must exist.
	 */
	tryGetParentElement(): Element | null {
		let node = this.getFirstNodeClosest()
		if (node) {
			return node.parentElement
		}
		
		if (this.endOuterPosition.type === SlotPositionType.BeforeSlot) {
			return (this.endOuterPosition.target as TemplateSlot).tryGetParentElement()
		}
		else {
			return null
		}
	}

	/** Get first node of the all the contents that inside of current slot. */
	getFirstNode(): ChildNode | null {
		if (this.contentType === SlotContentType.TemplateResult) {
			return (this.content as Template).getFirstNode()
		}
		else if (this.contentType === SlotContentType.TemplateResultArray) {
			if ((this.content as Template[]).length > 0) {
				let len = (this.content as Template[]).length
				for (let i = 0; i < len; i++) {
					let node = (this.content as Template[])[i].getFirstNode()
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
	 * Try to get first node inside, if miss,
	 * try to find next node exactly after current slot.
	 */
	getFirstNodeClosest(): ChildNode | null {
		let node = this.getFirstNode()
		if (node) {
			return node
		}

		if (this.endOuterPosition.type === SlotPositionType.Before) {
			return node
		}
		else if (this.endOuterPosition.type === SlotPositionType.BeforeSlot) {
			return (this.endOuterPosition.target as TemplateSlot).getFirstNodeClosest()
		}
		else {
			return null
		}
	}

	/** Update by value parameter but don't know it's type. */
	update(value: unknown) {
		let newContentType = this.recognizeContentType(value)

		if (newContentType !== this.contentType && this.contentType !== null) {
			this.clearOldContent()
		}

		this.contentType = newContentType

		if (newContentType === SlotContentType.TemplateResult) {
			this.updateTemplateResult(value as CompiledTemplateResult)
		}
		else if (newContentType === SlotContentType.TemplateResultArray) {
			this.updateTemplateResultArray(value as CompiledTemplateResult[])
		}
		else if (newContentType === SlotContentType.Text) {
			this.updateText(value)
		}
	}

	private recognizeContentType(value: unknown): SlotContentType {
		if (value instanceof CompiledTemplateResult) {
			return SlotContentType.TemplateResult
		}
		else if (Array.isArray(value)) {
			return SlotContentType.TemplateResultArray
		}
		else {
			return SlotContentType.Text
		}
	}

	private clearOldContent() {
		if (!this.content) {
			return
		}

		if (this.contentType === SlotContentType.TemplateResult) {
			this.removeTemplate(this.content as Template, null)
		}
		else if (this.contentType === SlotContentType.TemplateResultArray) {
			let ts = this.content as Template[]

			for (let i = 0; i < ts.length; i++) {
				let t = ts[i]
				let prevT = i > 0 ? ts[i - 1] : null

				this.removeTemplate(t, prevT)
			}
		}

		this.content = null
	}

	/** 
	 * Update template directly and manually without checking maker equality.
	 * `Template` type is not a auto-recognized content type, so you cant call `update()` with it.
	 * If template is managed and cached outside, update template here.
	 */
	updateTemplate(t: Template | null) { 
		let oldT = this.content as Template | null

		if (oldT === t) {
			return
		}

		if (oldT) {
			this.removeTemplate(oldT, null)
		}

		if (t) {
			t.insertNodesBefore(this.endOuterPosition)
		}

		this.content = t
	}

	updateTemplateResult(tr: CompiledTemplateResult) {
		let oldT = this.content as Template | null
		if (oldT && oldT.maker === tr.maker) {
			oldT.update(tr.values)
		}
		else {
			if (oldT) {
				this.removeTemplate(oldT, null)
			}

			let newT = tr.maker.make(this.context)
			newT.insertNodesBefore(this.endOuterPosition)
			newT.update(tr.values)
			
			this.content = newT
		}
	}

	updateTemplateResultArray(trs: CompiledTemplateResult[]) {
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
				let nextOldT = i < oldTs.length - 1 ? oldTs[i + 1] : null

				if (oldT) {
					this.removeTemplate(oldT, nextOldT)
				}
				
				this.insertTemplate(newT, nextOldT)
				newT.update(tr.values)

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

	private removeTemplate(t: Template, nextT: Template | null) {
		let position = nextT?.startInnerPosition || this.endOuterPosition
		t.recycleNodesBefore(position)
	}

	private insertTemplate(t: Template, nextT: Template | null) {
		let position = nextT?.startInnerPosition || this.endOuterPosition
		t.insertNodesBefore(position)
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
				this.endOuterPosition.insertBefore(node)
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