import {CompiledContentContainerPosition, ContentPosition, CompiledContentSiblingPosition, ContentPositionType} from './contant-position'
import {ContentSlot} from './content-slot'


/** Start or end position collapse with container element. */
export class CompiledContentRange {

	private start: ContentPosition
	private end: ContentPosition

	constructor(start: ContentPosition, end: ContentPosition) {
		this.start = start
		this.end = end
	}

	/** Get start node. */
	getStartNode(): Node | null {
		if (this.start.type === ContentPositionType.AfterBegin) {
			return (this.start as CompiledContentContainerPosition).parent.firstChild
		}
		else if (this.start.type === ContentPositionType.After) {
			let node = (this.start as CompiledContentSiblingPosition).sibling.nextSibling
		}
		else if () {

		}
	}

	/** Get start node. */
	getEndNode(): Node | null {
		
	}

	/** Get all the nodes in the range. */
	*walkNodes(): Iterable<ChildNode> {
		let node = this.startNode

		while (node) {
			yield node

			if (node === this.endNode) {
				break
			}

			node = node.nextSibling as ChildNode
		}
	}

	/** Insert all the nodes of specified range before start node of current range. */
	before(range: NodeRange) {
		this.startNode.before(range.extractToFragment())
	}

	/** Replace all the nodes in the range with the nodes of specified range. */
	replaceWith(range: NodeRange) {
		this.startNode.before(range.extractToFragment())
		this.remove()
	}

	/** 
	 * Remove all the nodes in range from parent container.
	 * Call this means you will never reuse nodes in the range.
	 */
	remove() {
		[...this.getNodes()].forEach(node => {
			(node as ChildNode).remove()
		})
	}
}
