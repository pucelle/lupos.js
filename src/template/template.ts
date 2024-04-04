import {ContentPosition, ContentEndInnerPositionType, ContentPositionType} from './content-position'
import {ContentSlot} from './content-slot'
import {TemplateMaker, TemplateInitResult} from './template-maker'


const DefaultDestroy = function(){}

/** Generate after a `TemplateClass` binded with a context. */
export class Template {

	private readonly templateEl: HTMLTemplateElement
	readonly maker: TemplateMaker
	readonly endInnerPosition: ContentPosition<ContentEndInnerPositionType>
	readonly update: (values: any[]) => void
	readonly destroy: () => void

	constructor(templateEl: HTMLTemplateElement, maker: TemplateMaker, initResult: TemplateInitResult) {
		this.templateEl = templateEl
		this.maker = maker

		this.endInnerPosition = initResult.endInnerPosition
		this.update = initResult.update
		this.destroy = initResult.destroy || DefaultDestroy
	}

	/** 
	 * Get last node of the contents in current slot.
	 * If have no fixed nodes, return last node of previois slot.
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

	/** Can walk only when nodes exist in current template. */
	walkNodes(): Iterable<ChildNode> {
		return this.templateEl.content.childNodes
	}
}