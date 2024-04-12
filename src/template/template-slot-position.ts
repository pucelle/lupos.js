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

export type SlotStartInnerPositionType = SlotPositionType.Before | SlotPositionType.BeforeSlot | SlotPositionType.BeforeContent
export type SlotEndOuterPositionType = SlotPositionType.Before | SlotPositionType.BeforeSlot | SlotPositionType.AfterContent


/** 
 * A `TemplateSlotPosition` indicates where a template slot located.
 * It try to find closest node, container, or slot for reference,
 * And helps to insert or remove contents from this position.
 */
export class TemplateSlotPosition<T = SlotPositionType> {

	type: T
	target: Element | Node | TemplateSlot

	constructor(type: T, target: Element | Node | TemplateSlot) {
		this.type = type
		this.target = target
	}

	/** Insert nodes before current position. */
	insertBefore(...newNodes: ChildNode[]) {
		if (this.type === SlotPositionType.Before) {
			let node = this.target as ChildNode
			node.before(...newNodes)
		}
		else if (this.type === SlotPositionType.BeforeSlot) {
			let slot = this.target as TemplateSlot
			let node = slot.getFirstNodeClosest()
			
			if (node) {
				node.before(...newNodes)
			}
			else {
				let parent = slot.tryGetParentElement()!
				parent.append(...newNodes)
			}
		}
		else {
			let parent = this.target as Element
			parent.append(...newNodes)
		}
	}

	/** Walk nodes backward before current position, until specified node or end. */
	*walkNodesForwardUntil(until: ChildNode | null): Iterable<ChildNode> {
		if (this.type === SlotPositionType.Before) {
			let node = (this.target as ChildNode).previousSibling

			while (node) {
				let prevNode = node.previousSibling

				// May remove current node when yield.
				yield node

				if (node === until) {
					break
				}

				node = prevNode
			}
		}
		else if (this.type === SlotPositionType.BeforeSlot) {
			let node = (this.target as TemplateSlot).getFirstNodeClosest()?.previousSibling
			
			while (node) {
				let prevNode = node.previousSibling
				yield node

				if (node === until) {
					break
				}

				node = prevNode
			}
		}
		else {
			let node = (this.target as Element).lastChild
			
			while (node) {
				let prevNode = node.previousSibling
				yield node

				if (node === until) {
					break
				}

				node = prevNode
			}
		}
	}
}
