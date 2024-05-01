import {TemplateSlotPosition, TemplateSlotPositionType, TemplateSlotEndOuterPositionType} from './template-slot-position'
import {Template} from './template'
import {CompiledTemplateResult} from './template-result-compiled'
import {Part} from '../types'
import {NodesTemplateMaker, TextTemplateMaker} from './template-makers'


/** Contents that can be included in a `<tag>${...}<.tag>`. */
export enum SlotContentType {
	TemplateResult,
	TemplateResultArray,
	Text,

	// Two not identified types, can use null instead.
	// NotIdentifiedNode,
	// NotIdentifiedTemplate,
}


/** 
 * A `TemplateSlot` indicates a `>${...}<` inside a template,
 * helps to update content of the slot.
 */
export class TemplateSlot implements Part {

	/** 
	 * End outer position, indicate where to put new content.
	 * 
	 * Note:
	 * - if located before a slot element with `:slot` specified,
	 * need to insert a comment before it and use it's position.
	 * - if located as after the content end of component, the "AfterContent" position
	 * of a component is not stable it may append more contents after component rendered,
	 * so need insert a comment after current slot and use it's position.
	 */
	readonly endOuterPosition: TemplateSlotPosition<TemplateSlotEndOuterPositionType>

	private context: any
	private contentType: SlotContentType | null = null
	private content: Template | Template[] | null = null

	constructor(
		endOuterPosition: TemplateSlotPosition<TemplateSlotEndOuterPositionType>,
		context: any,
		knownType: SlotContentType | null = null
	) {
		this.endOuterPosition = endOuterPosition
		this.context = context
		this.contentType = knownType
	}

	afterConnectCallback(param: number) {
		// No need to check whether `endOuterPosition` is `SlotPositionType.AfterContent`.
		// Because when component use this position, `directly` parameter is always be `0`.
		// When a template should use this position, it always be `0`, and add a comment instead.

		if (this.contentType === SlotContentType.TemplateResult) {
			(this.content as Template).afterConnectCallback(param)
		}
		else if (this.contentType === SlotContentType.TemplateResultArray) {
			for (let t of this.content as Template[]) {
				t.afterConnectCallback(param)
			}
		}
	}

	async beforeDisconnectCallback(param: number): Promise<void> {
		if (this.contentType === SlotContentType.TemplateResult) {
			return (this.content as Template).beforeDisconnectCallback(param)
		}
		else if (this.contentType === SlotContentType.TemplateResultArray) {
			let promises: Promise<void>[] = []
			
			for (let t of this.content as Template[]) {
				let p = t.beforeDisconnectCallback(param)
				if (p) {
					promises.push(p)
				}
			}

			return Promise.all(promises) as Promise<any>
		}
	}

	/** Replace context after initialized. */
	replaceContext(context: any) {
		this.context = context
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
		
		if (this.endOuterPosition.type === TemplateSlotPositionType.BeforeSlot) {
			return (this.endOuterPosition.target as TemplateSlot).tryGetParentElement()
		}
		else {
			return null
		}
	}

	/** Get first node of the all the contents that inside of current slot. */
	getFirstNode(): ChildNode | null {
		if (this.contentType === SlotContentType.TemplateResult || this.contentType === SlotContentType.Text) {
			if (this.content) {
				return (this.content as Template).getFirstNode()
			}
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
		}
	
		return null
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

		if (this.endOuterPosition.type === TemplateSlotPositionType.Before) {
			return (this.endOuterPosition.target as ChildNode)
		}
		else if (this.endOuterPosition.type === TemplateSlotPositionType.BeforeSlot) {
			return (this.endOuterPosition.target as TemplateSlot).getFirstNodeClosest()
		}
		else {
			return null
		}
	}

	/** 
	 * Update by value parameter but don't know it's type.
	 * Note value must be in one of 3 identifiable types.
	 */
	update(value: unknown) {
		let newContentType = this.identifyContentType(value)

		if (newContentType !== this.contentType && this.contentType !== null) {
			this.clearOldContent()
		}

		this.contentType = newContentType

		if (newContentType === SlotContentType.TemplateResult) {
			this.updateTemplateResult(value as CompiledTemplateResult)
		}
		else if (newContentType === SlotContentType.Text) {
			this.updateText(value)
		}
		else if (newContentType === SlotContentType.TemplateResultArray) {
			this.updateTemplateResultArray(value as CompiledTemplateResult[])
		}
	}

	private identifyContentType(value: unknown): SlotContentType | null {
		if (value instanceof CompiledTemplateResult) {
			return SlotContentType.TemplateResult
		}
		else if (Array.isArray(value)) {
			return SlotContentType.TemplateResultArray
		}
		else if (value !== null && value !== undefined) {
			return SlotContentType.Text
		}
		else {
			return null
		}
	}

	private clearOldContent() {
		if (!this.content) {
			return
		}

		if (this.contentType === SlotContentType.TemplateResult || this.contentType === SlotContentType.Text) {
			this.removeTemplate(this.content as Template)
		}
		else {
			let ts = this.content as Template[]

			for (let i = 0; i < ts.length; i++) {
				let t = ts[i]
				this.removeTemplate(t)
			}
		}

		this.content = null
	}

	/** Update template when knowing it's in template result type. */
	updateTemplateResult(tr: CompiledTemplateResult) {
		let oldT = this.content as Template | null
		if (oldT && oldT.maker === tr.maker) {
			oldT.update(tr.values)
		}
		else {
			if (oldT) {
				this.removeTemplate(oldT)
			}

			let newT = tr.maker.make(this.context)
			newT.insertNodesBefore(this.endOuterPosition)
			newT.update(tr.values)
			newT.callConnectCallback()
			
			this.content = newT
		}
	}

	/** Update template when knowing it's in template result list type. */
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
					this.removeTemplate(oldT)
				}
				
				this.insertTemplate(newT, nextOldT)
				newT.update(tr.values)
				newT.callConnectCallback()

				oldTs[i] = newT
			}
		}

		// Remove rest part.
		if (trs.length < oldTs.length) {
			for (let i = trs.length; i < oldTs.length; i++) {
				let oldT = oldTs[i]
				this.removeTemplate(oldT)
			}
		}
	}

	/** Update template when knowing it's in text type. */
	updateText(value: unknown) {
		let text = value === null || value === undefined ? '' : String(value).trim()
		let t = this.content as Template | null

		if (!t) {
			t = this.content = TextTemplateMaker.make(null)
			t.insertNodesBefore(this.endOuterPosition)
		}

		t.update([text])
	}

	/** 
	 * Update template manually without checking maker equality.
	 * When use this method, ensure current content type is `null`.
	 * Current value is not in auto-recognized content type, so you cant use `update()`.
	 * Use this when template is managed and cached outside, update template here.
	 */
	updateTemplateOnly(t: Template | null) { 
		let oldT = this.content as Template | null

		if (oldT === t) {
			return
		}

		if (oldT) {
			this.removeTemplate(oldT)
		}

		if (t) {
			t.insertNodesBefore(this.endOuterPosition)
		}

		this.content = t
	}

	/** 
	 * Update content to a group of nodes manually.
	 * When use this method, ensure current content type is `null`.
	 * Current value is not in auto-recognized content type, so you cant use `update()`.
	 * Use it for replacing nodes, like insert slot elements.
	 */
	updateNodesOnly(nodes: ChildNode[]) {
		let t = this.content as Template | null

		if (!t) {
			t = this.content = NodesTemplateMaker.make(null)
			t.insertNodesBefore(this.endOuterPosition)
		}

		t.update(nodes)
	}

	/** 
	 * Update content to a node manually.
	 * When use this method, ensure current content type is `null`.
	 * Current value is not in auto-recognized content type, so you cant use `update()`.
	 * Use it for replacing nodes, like insert slot elements.
	 */
	updateNodeOnly(node: ChildNode | null) {
		let t = this.content as Template | null

		if (!t) {
			t = this.content = NodesTemplateMaker.make(null)
			t.insertNodesBefore(this.endOuterPosition)
		}

		t.update(node ? [node] : [])
	}

	/** Insert a template before another. */
	private insertTemplate(t: Template, nextT: Template | null) {
		let position = nextT?.startInnerPosition || this.endOuterPosition
		t.insertNodesBefore(position)
	}

	/** Remove a template. */
	private removeTemplate(t: Template) {
		t.recycleNodes()
	}
}