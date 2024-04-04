import {ContentSlot} from './content-slot'


/** Contents that can be included in a `<tag>${...}<.tag>`. */
export enum ContentPositionType {

	/** Start position collapse with start of container context range. */
	AfterContentBegin,

	/** End position collapse with end of container context ranget. */
	BeforeContextEnd,

	/** Start position collapse with end of sibling node. */
	After,

	/** End position collapse with start of sibling node. */
	// Before,

	/** Start position collapse with end of content slot. */
	AfterSlot,

	/** End position collapse with start of content slot. */
	// BeforeSlot,
}

export type ContentStartOuterPositionType = ContentPositionType.After | ContentPositionType.AfterSlot | ContentPositionType.AfterContentBegin
export type ContentEndInnerPositionType = ContentPositionType.After | ContentPositionType.AfterSlot | ContentPositionType.BeforeContextEnd


/** Start or end position collapse with container element. */
export class ContentPosition<T = ContentPositionType> {

	type: T
	target: Element | Node | ContentSlot

	constructor(type: T, target: Element | Node | ContentSlot) {
		this.type = type
		this.target = target
	}

	/** Insert nodes after current position. */
	insertAfter(...newNodes: ChildNode[]) {
		if (this.type === ContentPositionType.After) {
			let node = this.target as ChildNode
			node.after(...newNodes)
		}
		else if (this.type === ContentPositionType.AfterSlot) {
			let slot = this.target as ContentSlot
			let node = slot.getLastNodeClosest()
			
			if (node) {
				node.after(...newNodes)
			}
			else {
				let parent = slot.tryGetParentElement()!
				parent.prepend(...newNodes)
			}
		}
		else {
			let parent = this.target as Element
			parent.prepend(...newNodes)
		}
	}

	/** Walk nodes after current position, until specified node. */
	*walkNodesUntil(until: ChildNode | null): Iterable<ChildNode> {
		if (this.type === ContentPositionType.After) {
			let node = (this.target as ChildNode).nextSibling

			while (node) {
				let nextNode = node.nextSibling

				// May remove current node when yield.
				yield node

				if (node === until) {
					break
				}

				node = nextNode
			}
		}
		else if (this.type === ContentPositionType.AfterSlot) {
			let node = (this.target as ContentSlot).getLastNodeClosest()?.nextSibling
			
			while (node) {
				let nextNode = node.nextSibling
				yield node

				if (node === until) {
					break
				}

				node = nextNode
			}
		}
		else {
			let node = (this.target as Element).firstChild
			
			while (node) {
				let nextNode = node.nextSibling
				yield node

				if (node === until) {
					break
				}

				node = nextNode
			}
		}
	}
}
