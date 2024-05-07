import {TemplateSlot} from './template-slot'


/** 
 * Contents that can be included in a `<tag>${...}<.tag>`.
 * **Do not** change the numeric values of each enum item.
 */
export enum SlotPositionType {

	/** 
	 * Start position collapse with start of container range.
	 * If don't know about future parent, will insert a comment at the beginning.
	 */
	BeforeContent = 0,

	/** End position collapse with end of container range. */
	AfterContent = 1,

	/** End position collapse with start of sibling node. */
	Before = 2,

	/** Start position collapse with end of sibling node. */
	// After = 3,

	/** End position collapse with start of slot. */
	BeforeSlot = 4,

	/** Start position collapse with end of slot. */
	// AfterSlot = 5,
}

export type SlotStartInnerPositionType = SlotPositionType.Before | SlotPositionType.BeforeSlot | SlotPositionType.BeforeContent
export type SlotEndOuterPositionType = SlotPositionType.Before | SlotPositionType.BeforeSlot | SlotPositionType.AfterContent

/** Target type by slot type. */
interface TargetTypeMap {
	[SlotPositionType.Before]: ChildNode
	[SlotPositionType.BeforeSlot]: TemplateSlot
	[SlotPositionType.BeforeContent]: Element
	[SlotPositionType.AfterContent]: Element
}


/** 
 * A `TemplateSlotPosition` indicates where a template slot located.
 * It try to find closest node, container, or slot for reference,
 * And helps to insert or remove contents from this position.
 */
export class SlotPosition<T = SlotPositionType> {

	type: T
	target: Element | ChildNode | TemplateSlot

	constructor(type: T, target: T extends keyof TargetTypeMap ? TargetTypeMap[T] : never) {
		this.type = type
		this.target = target
	}
	
	/** 
	 * Get first node of the all the contents that inside of current slot.
	 * Available only when current position represents a start inner position.
	 */
	getStartNode(this: SlotPosition<SlotStartInnerPositionType>): ChildNode | null {
		if (this.type === SlotPositionType.Before) {
			return (this.target as ChildNode)
		}
		else if (this.type === SlotPositionType.BeforeSlot) {
			return (this.target as TemplateSlot).getStartNode()
		}
		else {
			return null
		}
	}

	/** 
	 * Try to find next node exactly after current slot position.
	 * Available only when current position represents an ender outer position.
	 */
	getClosestOuterEndNode(this: SlotPosition<SlotEndOuterPositionType>): ChildNode | null {
		if (this.type === SlotPositionType.Before) {
			return (this.target as ChildNode)
		}
		else if (this.type === SlotPositionType.BeforeSlot) {
			return (this.target as TemplateSlot).getStartNodeClosest()
		}
		else {
			return null
		}
	}

	/** Insert nodes before current position. */
	insertNodesBefore(...newNodes: (ChildNode | DocumentFragment)[]) {
		if (this.type === SlotPositionType.Before) {
			let node = this.target as ChildNode
			node.before(...newNodes)
		}
		else if (this.type === SlotPositionType.BeforeSlot) {
			let slot = this.target as TemplateSlot
			let node = slot.getStartNodeClosest()
			
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

		if (this.type === SlotPositionType.Before) {
			untilBeforeNode = this.target as ChildNode
		}
		else if (this.type === SlotPositionType.BeforeSlot) {
			untilBeforeNode = (this.target as TemplateSlot).getStartNodeClosest()
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
