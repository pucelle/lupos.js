import {SlotPosition, SlotEndOuterPositionType} from './slot-position'
import {Template} from './template'
import {CompiledTemplateResult} from './template-result-compiled'
import {Part, PartCallbackParameter} from '../types'
import {NodesTemplateMaker, TextTemplateMaker} from './template-makers'


/** 
 * Represents the type of the contents that can be included
 * in a template literal like `<tag>${...}<.tag>`.
 */
export enum SlotContentType {
	TemplateResult,
	TemplateResultArray,
	Text,
	Node,

	// Not identified types, use null instead so not present.
	// NotIdentifiedTemplate,
}


/** 
 * A `TemplateSlot` locate a slot position `>${...}<` inside a template  literal,
 * it helps to update content of the slot.
 * Must know the content type of slot, otherwise use `DynamicTypedTemplateSlot`.
 */
export class TemplateSlot<T extends SlotContentType | null = SlotContentType> implements Part {

	/** End outer position, indicates where to put new content. */
	readonly endOuterPosition: SlotPosition<SlotEndOuterPositionType>

	protected context: any
	protected readonly contentType: T | null = null
	protected content: Template | Template[] | ChildNode | null = null

	constructor(
		endOuterPosition: SlotPosition<SlotEndOuterPositionType>,
		context: any,
		knownType: T | null = null
	) {
		this.endOuterPosition = endOuterPosition
		this.context = context
		this.contentType = knownType as T
	}

	afterConnectCallback(param: number) {
		if (this.contentType === SlotContentType.TemplateResult) {
			(this.content as Template).afterConnectCallback(param)
		}
		else if (this.contentType === SlotContentType.TemplateResultArray) {
			for (let t of this.content as Template[]) {
				t.afterConnectCallback(param)
			}
		}
	}

	beforeDisconnectCallback(param: number): Promise<void> | void {
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

			if (promises.length > 0) {
				return Promise.all(promises) as Promise<any>
			}
		}
	}

	/** 
	 * Replace context after initialized.
	 * Only for internal usage.
	 */
	replaceContext(context: any) {
		this.context = context
	}

	/** Get start inner node of the all the contents of current slot. */
	getStartNode(): ChildNode | null {
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
		else if (this.contentType === SlotContentType.Node) {
			return this.content as ChildNode
		}
	
		return null
	}

	/** 
	 * Try to get start inner node inside, if miss,
	 * try to find outer next node exactly after current slot.
	 */
	getStartNodeClosest(): ChildNode | null {
		return this.getStartNode() || this.endOuterPosition.getClosestOuterEndNode()
	}

	/** 
	 * Update by value parameter after known it's type.
	 * Note value must be strictly of the content type specified.
	 */
	update(value: unknown) {
		if (this.contentType === SlotContentType.TemplateResult) {
			this.updateTemplateResult(value as CompiledTemplateResult)
		}
		else if (this.contentType === SlotContentType.Text) {
			this.updateText(value)
		}
		else if (this.contentType === SlotContentType.TemplateResultArray) {
			this.updateTemplateResultArray(value as CompiledTemplateResult[])
		}
		else if (this.contentType === SlotContentType.Node) {
			this.updateNode(value as ChildNode)
		}
	}

	/** Update from a template result. */
	protected updateTemplateResult(tr: CompiledTemplateResult) {
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
			newT.afterConnectCallback(PartCallbackParameter.HappenInCurrentContext | PartCallbackParameter.DirectNodeToMove)
			
			this.content = newT
		}
	}

	/** Update from a template result list. */
	protected updateTemplateResultArray(trs: CompiledTemplateResult[]) {
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
				newT.afterConnectCallback(PartCallbackParameter.HappenInCurrentContext | PartCallbackParameter.DirectNodeToMove)

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

	/** Insert a template before another one. */
	protected insertTemplate(t: Template, nextT: Template | null) {
		let position = nextT?.startInnerPosition || this.endOuterPosition
		t.insertNodesBefore(position)
	}

	/** Remove a template. */
	protected removeTemplate(t: Template) {
		t.recycleNodes()
	}

	/** Update from a text-like value. */
	protected updateText(value: unknown) {
		let text = value === null || value === undefined ? '' : String(value).trim()
		let t = this.content as Template<[string]> | null

		if (!t) {
			t = this.content = TextTemplateMaker.make(null)
			t.insertNodesBefore(this.endOuterPosition)
		}

		t.update([text])
	}

	/** Update from a node. */
	protected updateNode(node: ChildNode) {
		let t = this.content as Template<ChildNode[]> | null

		if (node) {
			if (!t) {
				t = this.content = NodesTemplateMaker.make(null)
				t.insertNodesBefore(this.endOuterPosition)
			}

			t.update([node])
		}
		else {
			if (t) {
				t.update([])
			}
		}
	}

	/** 
	 * Update template manually without compare template maker.
	 * When use this method, ensure current content type is `null`.
	 * Use this when template is been managed and cached outside.
	 */
	updateTemplateOnly(this: TemplateSlot<null>, t: Template | null, values: any[] | null) { 
		let oldT = this.content as Template | null

		if (oldT === t) {
			return
		}

		if (oldT) {
			this.removeTemplate(oldT)
		}

		if (t) {
			t.insertNodesBefore(this.endOuterPosition)
			t.update(values!)
			t.afterConnectCallback(PartCallbackParameter.HappenInCurrentContext | PartCallbackParameter.DirectNodeToMove)
		}

		this.content = t
	}
}