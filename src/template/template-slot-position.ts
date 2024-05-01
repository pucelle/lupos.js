import {TemplateSlot} from './template-slot'


/** 
 * Contents that can be included in a `<tag>${...}<.tag>`.
 * **Do not** change the numeric values of each enum item.
 */
export enum TemplateSlotPositionType {

	/** 
	 * Start position collapse with start of container range.
	 * If don't know about future parent, will insert a comment at the beginning.
	 */
	BeforeContent = 0,

	/** End position collapse with end of container ranget. */
	AfterContent = 1,

	/** End position collapse with start of sibling node. */
	Before = 2,

	/** Start position collapse with end of sibling node. */
	// After,

	/** End position collapse with start of slot. */
	BeforeSlot = 4,

	/** Start position collapse with end of slot. */
	// AfterSlot,
}

export type TemplateSlotStartInnerPositionType = TemplateSlotPositionType.Before | TemplateSlotPositionType.BeforeSlot | TemplateSlotPositionType.BeforeContent
export type TemplateSlotEndOuterPositionType = TemplateSlotPositionType.Before | TemplateSlotPositionType.BeforeSlot | TemplateSlotPositionType.AfterContent

/** Target type by slot type. */
type TargetTypeMap<T> = 
	T extends TemplateSlotPositionType.Before ? Node
	: T extends TemplateSlotPositionType.BeforeSlot ? TemplateSlot
	: Element


/** 
 * A `TemplateSlotPosition` indicates where a template slot located.
 * It try to find closest node, container, or slot for reference,
 * And helps to insert or remove contents from this position.
 */
export class TemplateSlotPosition<T = TemplateSlotPositionType> {

	type: T
	target: Element | Node | TemplateSlot

	constructor(type: T, target: TargetTypeMap<T>) {
		this.type = type
		this.target = target
	}

	/** Insert nodes before current position. */
	insertNodesBefore(...newNodes: ChildNode[]) {
		if (this.type === TemplateSlotPositionType.Before) {
			let node = this.target as ChildNode
			node.before(...newNodes)
		}
		else if (this.type === TemplateSlotPositionType.BeforeSlot) {
			let slot = this.target as TemplateSlot
			let node = slot.getFirstNodeClosest()
			
			if (node) {
				node.before(...newNodes)
			}
			else {
				slot.endOuterPosition.insertNodesBefore(...newNodes)
			}
		}
		else {
			let parent = this.target as Element
			parent.append(...newNodes)
		}
	}

	/** Walk nodes from specified node, and until before of current position. */
	*walkNodesFrom(from: ChildNode): Iterable<ChildNode> {
		let untilBeforeNode: ChildNode | null
		let node: ChildNode | null = from

		if (this.type === TemplateSlotPositionType.Before) {
			untilBeforeNode = this.target as ChildNode
		}
		else if (this.type === TemplateSlotPositionType.BeforeSlot) {
			untilBeforeNode = (this.target as TemplateSlot).getFirstNodeClosest()
		}
		else {
			untilBeforeNode = null
		}

		do {
			yield node
			node = node.nextSibling
		}
		while (node && node !== untilBeforeNode)
	}
}
