import {EditType, getEditRecord} from '@pucelle/ff'
import {CompiledTemplateResult, Template, TemplateSlot} from '../template'
import {PartCallbackParameterMask} from '../types'


/** 
 * The render function to render each item,
 * pass it directly from original template.
 * This must be a fixed function, or it would can't be optimized.
 */
type ForBlockRenderFn = (item: any, index: number) => CompiledTemplateResult


/** 
 * Make it by compiling:
 * ```
 * 	<for ${...}>${(item) => html`
 * 		...
 * 	`}</for>
 * ```
 */
export class ForBlock<T = any> {

	readonly renderFn: ForBlockRenderFn
	readonly slot: TemplateSlot
	readonly context: any

	private data: T[] = []
	private templates: Template[] = []

	constructor(renderFn: ForBlockRenderFn, slot: TemplateSlot, context: any) {
		this.renderFn = renderFn
		this.slot = slot		
		this.context = context
	}

	/** Update data items. */
	async update(newData: T[]) {
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
			else if (type === EditType.Move) {
				this.moveTemplate(fromT!, nextOldT)
				this.reuseTemplate(fromT!, newItem!, toIndex)
			}
			else if (type === EditType.MoveModify) {
				this.moveTemplate(fromT!, nextOldT)
				this.reuseTemplate(fromT!, newItem!, toIndex)
			}
			else if (type === EditType.Insert) {
				this.createTemplate(newItem!, toIndex, nextOldT!)
			}
			else if (type === EditType.Delete) {
				this.removeTemplate(fromT!)
			}
		}
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
		let result = this.renderFn(item, index)
		let t = result.maker.make(this.context)

		this.insertTemplate(t, nextOldT)
		t.update(result.values)
		t.afterConnectCallback(PartCallbackParameterMask.HappenInCurrentContext | PartCallbackParameterMask.DirectNodeToMove)

		this.templates.push(t)
	}

	private reuseTemplate(t: Template, item: T, index: number) {
		let result = this.renderFn(item, index)

		t.update(result.values)
		t.afterConnectCallback(PartCallbackParameterMask.HappenInCurrentContext | PartCallbackParameterMask.DirectNodeToMove)
		
		this.templates.push(t)
	}

	private removeTemplate(t: Template) {
		t.recycleNodes()
	}

	private async moveTemplate(t: Template, nextOldT: Template | null) {
		let position = nextOldT?.startInnerPosition ?? this.slot.endOuterPosition
		t.moveNodesBefore(position)
	}

	private insertTemplate(t: Template, nextOldT: Template | null) {
		let position = nextOldT?.startInnerPosition ?? this.slot.endOuterPosition
		t.insertNodesBefore(position)
	}
}