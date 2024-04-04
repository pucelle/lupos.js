import {ContentPosition, ContentEndPositionType, ContentPositionType} from './contant-position'
import {ContentSlot} from './content-slot'
import {Template, TemplateInitResult} from './template'


const DefaultDestroy = function(){}

/** Generate after a `CompiledTemplate` binded with a context. */
export class TemplateResult {

	private template: Template
	private templateEl: HTMLTemplateElement
	private endInnerPosition: ContentPosition<ContentEndPositionType>
	update: () => void
	destroy: () => void

	constructor(template: Template, templateEl: HTMLTemplateElement, initResult: TemplateInitResult) {
		this.template = template
		this.templateEl = templateEl

		this.endInnerPosition = initResult.endInnerPosition
		this.update = initResult.update
		this.destroy = initResult.destroy || DefaultDestroy
	}

	/** 
	 * Get last node of the contents in current slot.
	 * If have no fixed nodes, return last node of previois slot.
	 */
	getLastNode(): Node | null {
		if (this.endInnerPosition.type === ContentPositionType.After) {
			return this.endInnerPosition.target as Node
		}
		else if (this.endInnerPosition.type === ContentPositionType.BeforeEnd) {
			return this.endInnerPosition.target as Element
		}
		else {
			return (this.endInnerPosition.target as ContentSlot).getLastNode()
		}
	}
}