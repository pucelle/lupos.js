import {SlotPosition, SlotEndOuterPositionType} from './slot-position'
import {Template} from './template'
import {CompiledTemplateResult} from './template-result-compiled'
import {hasConnectCallbackParameter, Part, PartCallbackParameterMask} from '../part'
import {NodeTemplateMaker, TextTemplateMaker} from './template-makers'


/** 
 * Represents the type of the contents that can be included
 * in a template literal like `<tag>${...}<.tag>`.
 */
export enum SlotContentType {
	TemplateResult = 0,
	TemplateResultList = 1,
	Text = 2,

	// Normally for only internal usage.
	Node = 3,
}


/** 
 * A `TemplateSlot` locate a slot position `>${...}<` inside a template  literal,
 * it helps to update content of the slot.
 * Must know the content type of slot, otherwise use `DynamicTypedTemplateSlot`.
 */
export class TemplateSlot<T extends SlotContentType | null = SlotContentType> implements Part {

	/** End outer position, indicates where to put new content. */
	readonly endOuterPosition: SlotPosition<SlotEndOuterPositionType>
	readonly context: any

	private contentType: T | null = null
	private readonly knownContentType: boolean
	private content: Template | Template[] | null = null

	constructor(
		endOuterPosition: SlotPosition<SlotEndOuterPositionType>,
		context: any,
		knownType: T | null = null
	) {
		this.endOuterPosition = endOuterPosition
		this.context = context
		this.contentType = knownType as T
		this.knownContentType = knownType !== null
	}

	afterConnectCallback(param: PartCallbackParameterMask | 0) {
		if (this.contentType === SlotContentType.TemplateResultList) {
			for (let t of this.content as Template[]) {
				t.afterConnectCallback(param)
			}
		}
		else if (this.contentType !== null) {
			(this.content as Template).afterConnectCallback(param)
		}
	}

	beforeDisconnectCallback(param: PartCallbackParameterMask | 0): Promise<void> | void {
		if (this.contentType === SlotContentType.TemplateResult) {
			return (this.content as Template).beforeDisconnectCallback(param)
		}
		else if (this.contentType === SlotContentType.TemplateResultList) {
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
	 * Update by value parameter after known it's type.
	 * Note value must be strictly of the content type specified.
	 */
	update(value: unknown) {
		if (!this.knownContentType) {
			let newContentType = this.identifyContentType(value)
			if (newContentType !== this.contentType) {
				this.clearContent()
			}

			this.contentType = newContentType
		}

		if (this.contentType === SlotContentType.TemplateResult) {
			this.updateTemplateResult(value as CompiledTemplateResult)
		}
		else if (this.contentType === SlotContentType.TemplateResultList) {
			this.updateTemplateResultList(value as CompiledTemplateResult[])
		}
		else if (this.contentType === SlotContentType.Text) {
			this.updateText(value)
		}
		else if (this.contentType === SlotContentType.Node) {
			this.updateNode(value as ChildNode)
		}
	}
	
	/** Identify content type by value. */
	private identifyContentType(value: unknown): T | null {
		if (value === null || value === undefined) {
			return null
		}
		else if (value instanceof CompiledTemplateResult) {
			return SlotContentType.TemplateResult as T
		}
		else if (Array.isArray(value)) {
			return SlotContentType.TemplateResultList as T
		}
		else if (value instanceof Node) {
			return SlotContentType.Node as T
		}
		else {
			return SlotContentType.Text as T
		}
	}

	/** Clear current content, reset content and content type. */
	private clearContent() {
		if (!this.content) {
			return
		}

		if (this.contentType === SlotContentType.TemplateResult
			|| this.contentType === SlotContentType.Text
			|| this.contentType === SlotContentType.Node
		) {
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
		this.contentType = null
	}

	/** Update from a template result. */
	private updateTemplateResult(tr: CompiledTemplateResult) {
		let oldT = this.content as Template | null
		if (oldT && oldT.maker === tr.maker) {
			oldT.update(tr.values)
		}
		else {
			if (oldT) {
				this.removeTemplate(oldT)
			}

			let newT = tr.maker.make(this.context, tr.values)
			newT.insertNodesBefore(this.endOuterPosition)
			newT.update(tr.values)

			if (!hasConnectCallbackParameter(this)) {
				newT.afterConnectCallback(PartCallbackParameterMask.HappenInCurrentContext | PartCallbackParameterMask.DirectNodeToMove)
			}
			
			this.content = newT
		}
	}

	/** Update from a template result list. */
	private updateTemplateResultList(trs: CompiledTemplateResult[]) {
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
				let newT = tr.maker.make(this.context, tr.values)
				let nextOldT = i < oldTs.length - 1 ? oldTs[i + 1] : null

				if (oldT) {
					this.removeTemplate(oldT)
				}
				
				this.insertTemplate(newT, nextOldT)
				newT.update(tr.values)

				if (!hasConnectCallbackParameter(this)) {
					newT.afterConnectCallback(PartCallbackParameterMask.HappenInCurrentContext | PartCallbackParameterMask.DirectNodeToMove)
				}

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
	private insertTemplate(t: Template, nextT: Template | null) {
		let position = nextT?.startInnerPosition ?? this.endOuterPosition
		t.insertNodesBefore(position)
	}

	/** Remove a template. */
	private removeTemplate(t: Template) {
		t.recycleNodes()
	}

	/** Update from a text-like value. */
	private updateText(value: unknown) {
		let text = value === null || value === undefined ? '' : String(value).trim()
		let t = this.content as Template<[string]> | null

		if (!t) {
			t = this.content = TextTemplateMaker.make(null, null)
			t.insertNodesBefore(this.endOuterPosition)
		}

		t.update([text])
	}

	/** Update from a node. */
	private updateNode(node: ChildNode | null) {
		let t = this.content as Template<ChildNode[]> | null

		if (node) {
			if (!t) {
				t = this.content = NodeTemplateMaker.make(null, null)
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
	 * Update template manually and directly without comparing template maker.
	 * Use this when template is been managed and cached outside.
	 */
	updateTemplateDirectly(this: TemplateSlot, t: Template | null, values: any[]) {
		let oldT = this.content as Template | null

		if (oldT === t) {
			if (t && values) {
				t.update(values)
			}
		}
		else {
			if (oldT) {
				this.removeTemplate(oldT)
			}

			if (t) {
				t.insertNodesBefore(this.endOuterPosition)
				t.update(values!)

				if (!hasConnectCallbackParameter(this)) {
					t.afterConnectCallback(PartCallbackParameterMask.HappenInCurrentContext | PartCallbackParameterMask.DirectNodeToMove)
				}
			}

			this.content = t
		}
	}

	/** 
	 * Update template list manually and directly without comparing template maker.
	 * Use this when template list is been managed and cached outside.
	 */
	updateTemplateListDirectly(list: Template[]) {
		this.content = list
	}
}