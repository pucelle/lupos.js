import {SlotPosition, SlotPositionType} from './slot-position'


/** 
 * Locate the start and end of a node range.
 * So later can pick nodes of the range and move them.
 * 
 * Use it to remember rest slot range.
 * Compiler may need to insert a comment node in the end of
 * current range to make the end position static.
 */
export class SlotRange {

	private startInnerPosition: SlotPosition<SlotPositionType.Before | SlotPositionType.BeforeSlot>
	private endInnerNode: ChildNode

	constructor(startInnerPosition: SlotPosition<SlotPositionType.Before | SlotPositionType.BeforeSlot>, endInnerNode: ChildNode) {
		this.startInnerPosition = startInnerPosition
		this.endInnerNode = endInnerNode
	}

	/** Insert nodes before a specified position. */
	insertNodesBefore(position: SlotPosition) {
		position.insertNodesBefore(...this.walkNodes())
	}

	/** Walk nodes in the range. */
	*walkNodes(): Iterable<ChildNode> {
		let node = this.startInnerPosition.getStartNode()

		while (node) {
			yield node

			if (node === this.endInnerNode) {
				break
			}

			node = node.nextSibling
		}
	}
}
