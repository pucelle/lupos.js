import {ContentPosition, ContentEndInnerPositionType, ContentPositionType} from './content-position'
import {ContentSlot} from './content-slot'
import {TemplateMaker, TemplateInitResult} from './template-maker'


const EmptyFn = function(){}


/** Generate after a `TemplateClass` binded with a context. */
export class Template implements TemplateInitResult {

	readonly el: HTMLTemplateElement
	readonly maker: TemplateMaker
	readonly endInnerPosition: ContentPosition<ContentEndInnerPositionType>
	readonly update: (values: any[]) => void
	readonly remove: () => void

	constructor(el: HTMLTemplateElement, maker: TemplateMaker, initResult: TemplateInitResult) {
		this.el = el
		this.maker = maker

		this.endInnerPosition = initResult.endInnerPosition
		this.update = initResult.update || EmptyFn
		this.remove = initResult.remove || EmptyFn
	}

	/** 
	 * Get last node of the contents in current slot.
	 * If have no fixed nodes, return last node of previois slot.
	 * Can only get when nodes exist in current template.
	 */
	getLastNode(): ChildNode | null {
		if (this.endInnerPosition.type === ContentPositionType.After) {
			return this.endInnerPosition.target as ChildNode
		}
		else if (this.endInnerPosition.type === ContentPositionType.AfterSlot) {
			return (this.endInnerPosition.target as ContentSlot).getLastNode()
		}
		else {
			return this.endInnerPosition.target as Element
		}
	}

	/** 
	 * Walk for child nodes in the template.
	 * Can only walk when nodes exist in current template.
	 */
	walkNodes(): Iterable<ChildNode> {
		return this.el.content.childNodes
	}
}