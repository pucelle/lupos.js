import {TemplateSlotPosition, SlotStartInnerPositionType, SlotPositionType} from './template-slot-position'
import {TemplateSlot} from './template-slot'
import {TemplateMaker, TemplateInitResult} from './template-maker'
import {noop} from '@pucelle/ff'


/** Generate after a `TemplateClass` binded with a context. */
export class Template implements Part {

	readonly el: HTMLTemplateElement
	readonly maker: TemplateMaker
	readonly startInnerPosition: TemplateSlotPosition<SlotStartInnerPositionType>
	readonly update: (values: any[]) => void
	private readonly listOfParts: [Part, 0 | 1][]

	constructor(el: HTMLTemplateElement, maker: TemplateMaker, initResult: TemplateInitResult) {
		this.el = el
		this.maker = maker

		this.startInnerPosition = initResult.p
		this.listOfParts = initResult.l || []
		this.update = initResult.u || noop
	}

	afterConnectCallback(directly: 0 | 1) {
		for (let [part, topLevel] of this.listOfParts) {
			part.afterConnectCallback((directly & topLevel) as 0 | 1)
		}
	}

	beforeDisconnectCallback(directly: 0 | 1): Promise<void> {
		let promises: Promise<void>[] = []

		for (let [part, topLevel] of this.listOfParts) {
			let p = part.beforeDisconnectCallback((directly & topLevel) as 0 | 1)
			if (p) {
				promises.push(p)
			}
		}

		return Promise.all(promises) as Promise<any>
	}

	/** 
	 * Get last node of the contents in current slot.
	 * If have no fixed nodes, return last node of previois slot.
	 * Can only get when nodes exist in current template.
	 */
	getFirstNode(): ChildNode | null {
		if (this.startInnerPosition.type === SlotPositionType.Before) {
			return this.startInnerPosition.target as ChildNode
		}
		else if (this.startInnerPosition.type === SlotPositionType.BeforeSlot) {
			return (this.startInnerPosition.target as TemplateSlot).getFirstNode()
		}
		else {
			return this.startInnerPosition.target as Element
		}
	}

	/** Insert nodes before an end position. */
	insertNodesBefore(position: TemplateSlotPosition) {
		position.insertBefore(...this.el.content.childNodes)
		this.afterConnectCallback(1)
	}

	/** Recycle nodes before an end position. */
	async recycleNodesBefore(position: TemplateSlotPosition) {
		await this.beforeDisconnectCallback(1)

		let firstNode = this.getFirstNode()
		if (!firstNode) {
			return
		}

		for (let node of position.walkNodesForwardUntil(firstNode)) {
			this.el.prepend(node)
		}
	}
}