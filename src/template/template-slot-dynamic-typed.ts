import {SlotEndOuterPositionType, SlotPosition} from './slot-position'
import {Template} from './template'
import {CompiledTemplateResult} from './template-result-compiled'
import {SlotContentType, TemplateSlot} from './template-slot'


/** 
 * Don't known about content type,
 * must detect it from content data.
 */
export class DynamicTypedTemplateSlot<T extends SlotContentType | null = SlotContentType> extends TemplateSlot<T> {

	/** Can update it. */
	declare protected contentType: T | null

	constructor(endOuterPosition: SlotPosition<SlotEndOuterPositionType>, context: any) {
		super(endOuterPosition, context)
	}

	/** 
	 * Update by value parameter but don't know it's type early.
	 * Note value must be in one of 4 identifiable types.
	 */
	update(value: unknown) {
		let newContentType = this.identifyContentType(value)

		if (newContentType !== this.contentType) {
			this.clearContent()
		}

		this.contentType = newContentType

		super.update(value)
	}

	/** Identify content type by value. */
	protected identifyContentType(value: unknown): T | null {
		if (value === null || value === undefined) {
			return null
		}
		else if (value instanceof CompiledTemplateResult) {
			return SlotContentType.TemplateResult as T
		}
		else if (Array.isArray(value)) {
			return SlotContentType.TemplateResultArray as T
		}
		else if (value instanceof Node) {
			return SlotContentType.Node as T
		}
		else {
			return SlotContentType.Text as T
		}
	}

	/** Clear current content, reset content and content type. */
	protected clearContent() {
		if (!this.content) {
			return
		}

		if (this.contentType === SlotContentType.TemplateResult
			|| this.contentType === SlotContentType.Text
			|| this.contentType === SlotContentType.Node
		) {
			this.removeTemplate(this.content as Template)
		}
		else {
			let ts = this.content as Template[]

			for (let i = 0; i < ts.length; i++) {
				let t = ts[i]
				this.removeTemplate(t)
			}
		}

		this.content = null
		this.contentType = null
	}
}