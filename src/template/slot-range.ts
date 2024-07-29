import {SlotPosition, SlotPositionType} from './slot-position'


/** 
 * Locate the start and end position of a node range.
 * So later can pick nodes within the range and move them.
 * 
 * Use it to remember rest slot range.
 * Compiler may need to insert a comment node in the end
 * to make the end inner node static, and avoid breaking the
 * range after component-itself contents appended.
 */
export class SlotRange {

	private startInnerPosition: SlotPosition<SlotPositionType.Before | SlotPositionType.BeforeSlot>
	private endInnerNode: ChildNode

	constructor(startInnerPosition: SlotPosition<SlotPositionType.Before | SlotPositionType.BeforeSlot>, endInnerNode: ChildNode) {
		this.startInnerPosition = startInnerPosition
		this.endInnerNode = endInnerNode
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
