import {TemplateSlotPosition, SlotStartInnerPositionType, SlotPositionType} from './template-slot-position'
import {TemplateSlot} from './template-slot'
import {TemplateMaker, TemplateInitResult} from './template-maker'


/** Generate after a `TemplateClass` binded with a context. */
export class Template {

	readonly el: HTMLTemplateElement
	readonly maker: TemplateMaker
	readonly startInnerPosition: TemplateSlotPosition<SlotStartInnerPositionType>
	readonly connect: () => void
	readonly update: (values: any[]) => void

	constructor(el: HTMLTemplateElement, maker: TemplateMaker, initResult: TemplateInitResult) {
		this.el = el
		this.maker = maker

		this.startInnerPosition = initResult.p
		this.connect = initResult.c
		this.update = initResult.u
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

	/** 
	 * Walk for child nodes in the template.
	 * Can only walk when nodes exist in current template.
	 */
	walkNodes(): Iterable<ChildNode> {
		return this.el.content.childNodes
	}

	/** Recycle nodes backword, before an end position. */
	recycleNodesBefore(position: TemplateSlotPosition) {
		let firstNode = this.getFirstNode()
		if (!firstNode) {
			return
		}

		for (let node of position.walkNodesForwardUntil(firstNode)) {
			this.el.prepend(node)
		}
	}
}