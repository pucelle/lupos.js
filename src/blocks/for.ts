import {EditType, getEditRecord} from '@pucelle/ff'
import {CompiledTemplateResult, Template, TemplateSlot} from '../template'
import {PartCallbackParameter} from '../types'


/** Type of compiling statements like `<for of=${...}>...`. */
type ForBlock = (slot: TemplateSlot, context: any) => {
	update(values: any[]): void
}

/** To render each item. */
type ForRenderFn = (item: any, index: number) => CompiledTemplateResult


/** 
 * Make it by compiling:
 * ```
 * 	<for of=${...}>${(item) => html`
 * 		...
 * 	`}</for>
 * ```
 */
export function createForBlockFn(renderFn: ForRenderFn): ForBlock {
	return function(slot: TemplateSlot, context: any) {
		let updator = new ForUpdator(slot, context, renderFn)
	
		return {
			update(items: any[]) {
				updator.update(items)
			}
		}
	}
}


/** Help to update for data items. */
class ForUpdator<T> {

	private readonly slot: TemplateSlot
	private readonly context: any
	private readonly renderFn: ForRenderFn

	private data: T[] = []
	private templates: Template[] = []

	constructor(slot: TemplateSlot, context: any, renderFn: ForRenderFn) {
		this.slot = slot		
		this.context = context
		this.renderFn = renderFn
	}

	/** Update data items. */
	async update(newData: T[]) {
		let oldData = this.data
		let oldTs = this.templates
		let editRecord = getEditRecord(oldData, newData, true)

		this.data = newData
		this.templates = []

		for (let record of editRecord) {
			let {type, nextOldIndex, fromIndex, toIndex} = record
			let nextOldT = this.getItemAtIndex(oldTs, nextOldIndex)
			let fromT = this.getItemAtIndex(oldTs, fromIndex)
			let newItem = toIndex >= 0 ? newData[toIndex] : null

			if (type === EditType.Leave) {
				this.reuseTemplate(fromT!, newItem!, toIndex)
			}
			else if (type === EditType.Move) {
				this.moveTemplate(fromT!, nextOldT)
				this.reuseTemplate(fromT!, newItem!, toIndex)
			}
			else if (type === EditType.Modify) {
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
		t.afterConnectCallback(PartCallbackParameter.HappenInCurrentContext | PartCallbackParameter.DirectNodeToMove)

		this.templates.push(t)
	}

	private reuseTemplate(t: Template, item: T, index: number) {
		let result = this.renderFn(item, index)

		t.update(result.values)
		t.afterConnectCallback(PartCallbackParameter.HappenInCurrentContext | PartCallbackParameter.DirectNodeToMove)
		
		this.templates.push(t)
	}

	private removeTemplate(t: Template) {
		t.recycleNodes()
	}

	private async moveTemplate(t: Template, nextOldT: Template | null) {
		let position = nextOldT?.startInnerPosition || this.slot.endOuterPosition
		t.moveNodesBefore(position)
	}

	private insertTemplate(t: Template, nextOldT: Template | null) {
		let position = nextOldT?.startInnerPosition || this.slot.endOuterPosition
		t.insertNodesBefore(position)
	}
}