import {EditType, getEditRecord} from '../structs/edit'
import {CompiledTemplateResult, Template, TemplateSlot} from '../template'
import {PartCallbackParameterMask} from '../part'


/** 
 * The render function to render each item,
 * pass it directly from original template.
 * This must be a fixed function, or it would can't be optimized.
 */
type ForBlockRenderFn = (item: any, index: number) => CompiledTemplateResult


/** 
 * Make it by compiling:
 * ```html
 * 	<lu:for ${...}>${(item) => html`
 * 		...
 * 	`}</lu:for>
 * ```
 */
export class ForBlock<T = any> {

	readonly slot: TemplateSlot
	readonly context: any

	private renderFn!: ForBlockRenderFn
	private data: T[] = []
	private templates: Template[] = []

	constructor(slot: TemplateSlot) {
		this.slot = slot
	}

	/** Update render function. */
	updateRenderFn(renderFn: ForBlockRenderFn) {
		this.renderFn = renderFn
	}

	/** Update data items. */
	updateData(data: Iterable<T>) {

		// Must clone, will compare it with the data at next time updating.
		let newData = [...data]

		let oldData = this.data
		let oldTs = this.templates
		let editRecord = getEditRecord(oldData, newData, true)

		this.data = newData
		this.templates = []

		for (let record of editRecord) {
			let {type, insertIndex, fromIndex, toIndex} = record
			let nextOldT = this.getItemAtIndex(oldTs, insertIndex)
			let fromT = this.getItemAtIndex(oldTs, fromIndex)
			let newItem = toIndex >= 0 ? newData[toIndex] : null

			if (type === EditType.Leave) {
				this.reuseTemplate(fromT!, newItem!, toIndex)
			}
			else if (type === EditType.Move || type === EditType.MoveModify) {
				this.moveTemplate(fromT!, nextOldT)
				this.reuseTemplate(fromT!, newItem!, toIndex)
			}
			else if (type === EditType.Insert) {
				this.createTemplate(newItem!, toIndex, nextOldT!)
			}
			else if (type === EditType.Delete) {
				this.removeTemplate(fromT!, fromIndex)
			}
		}

		this.slot.updateExternalTemplateList(this.templates)
	}

	private getItemAtIndex<T>(items: T[], index: number): T | null {
		if (index < items.length && index >= 0) {
			return items[index]
		}
		else {
			return null
		}
	}

	private createTemplate(item: T, index: number, nextOldT: Template | null) {
		let result = this.renderFn(item, index)!
		let t = result.maker.make(result.context)

		this.insertTemplate(t, nextOldT)
		t.update(result.values)

		// `lu:for` use it's slot to cache child parts.
		if (this.slot.connected) {
			t.afterConnectCallback(PartCallbackParameterMask.MoveFromOwnStateChange | PartCallbackParameterMask.MoveAsDirectNode)
		}

		this.templates.push(t)
	}

	private reuseTemplate(t: Template, item: T, index: number) {
		let result = this.renderFn(item, index)!
		t.update(result.values)
		this.templates.push(t)
	}

	private removeTemplate(t: Template, _index: number) {
		t.recycleNodes()
	}

	private moveTemplate(t: Template, nextOldT: Template | null) {
		let position = nextOldT?.startInnerPosition ?? this.slot.endOuterPosition
		t.moveNodesBefore(position)
	}

	private insertTemplate(t: Template, nextOldT: Template | null) {
		let position = nextOldT?.startInnerPosition ?? this.slot.endOuterPosition
		t.insertNodesBefore(position)
	}
}
