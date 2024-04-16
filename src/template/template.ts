import {TemplateSlotPosition, SlotStartInnerPositionType, SlotPositionType} from './template-slot-position'
import {TemplateSlot} from './template-slot'
import {TemplateMaker, TemplateInitResult} from './template-maker'
import {noop} from '@pucelle/ff'
import {Part, PartCallbackParameter} from '../types'


/** 
 * Represents a template make from a html`...`
 * Be generated after a `TemplateMaker` binded with a context.
 */
export class Template implements Part {

	readonly el: HTMLTemplateElement
	readonly maker: TemplateMaker
	readonly startInnerPosition: TemplateSlotPosition<SlotStartInnerPositionType>
	readonly update: (values: any[]) => void
	private readonly partList: [Part, number][]

	constructor(el: HTMLTemplateElement, maker: TemplateMaker, initResult: TemplateInitResult) {
		this.el = el
		this.maker = maker

		this.startInnerPosition = initResult.p
		this.partList = initResult.l || []
		this.update = initResult.u || noop
	}

	afterConnectCallback(param: number) {
		for (let [part, topLevel] of this.partList) {
			part.afterConnectCallback(param & topLevel)
		}
	}

	beforeDisconnectCallback(param: number): Promise<void> {
		let promises: Promise<void>[] = []

		for (let [part, topLevel] of this.partList) {
			let p = part.beforeDisconnectCallback(param & topLevel)
			if (p) {
				promises.push(p)
			}
		}

		return Promise.all(promises) as Promise<any>
	}

	/** 
	 * Get last node of the contents in current slot.
	 * If have no fixed nodes, return last node of previois slot.
	 * Can only get when nodes exist in current template.
	 */
	getFirstNode(): ChildNode | null {
		if (this.startInnerPosition.type === SlotPositionType.Before) {
			return this.startInnerPosition.target as ChildNode
		}
		else if (this.startInnerPosition.type === SlotPositionType.BeforeSlot) {
			return (this.startInnerPosition.target as TemplateSlot).getFirstNode()
		}
		else {
			return this.startInnerPosition.target as Element
		}
	}

	/** Insert nodes before an end position. */
	insertNodesBefore(position: TemplateSlotPosition) {
		position.insertBefore(...this.el.content.childNodes)
	}

	/** After nodes inserted and template updated, call connect callback. */
	callConnectCallback() {
		this.afterConnectCallback(PartCallbackParameter.HappenInCurrentContext | PartCallbackParameter.DirectlyMoveNodes)
	}

	/** Recycle nodes before an end position. */
	async recycleNodesBefore(position: TemplateSlotPosition) {
		await this.beforeDisconnectCallback(PartCallbackParameter.HappenInCurrentContext | PartCallbackParameter.DirectlyMoveNodes)

		let firstNode = this.getFirstNode()
		if (!firstNode) {
			return
		}

		for (let node of position.walkNodesForwardUntil(firstNode)) {
			this.el.prepend(node)
		}
	}
}