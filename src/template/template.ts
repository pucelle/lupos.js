import {TemplateSlotPosition, TemplateSlotStartInnerPositionType, TemplateSlotPositionType} from './template-slot-position'
import {TemplateSlot} from './template-slot'
import {TemplateMaker, TemplateInitResult} from './template-maker'
import {noop} from '@pucelle/ff'
import {Part, PartCallbackParameter} from '../types'
import {TemplateSlotPositionMap} from './template-slot-position-map'


/** Help to cache template insert position. */
const PositionMap = new TemplateSlotPositionMap()


/** 
 * Represents a template make from a html`...`
 * Be generated after a `TemplateMaker` binded with a context.
 */
export class Template implements Part {

	readonly el: HTMLTemplateElement | null
	readonly maker: TemplateMaker
	readonly startInnerPosition: TemplateSlotPosition<TemplateSlotStartInnerPositionType>
	readonly update: (values: any[]) => void
	private readonly parts: [Part, number][]

	constructor(maker: TemplateMaker, initResult: TemplateInitResult) {
		this.maker = maker

		this.el = initResult.el || null
		this.startInnerPosition = initResult.position
		this.parts = initResult.parts || []
		this.update = initResult.update || noop
	}

	afterConnectCallback(param: number) {
		for (let [part, topLevel] of this.parts) {
			part.afterConnectCallback(param & topLevel)
		}
	}

	beforeDisconnectCallback(param: number): Promise<void> {
		let promises: Promise<void>[] = []

		for (let [part, topLevel] of this.parts) {
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
		if (this.startInnerPosition.type === TemplateSlotPositionType.Before) {
			return this.startInnerPosition.target as ChildNode
		}
		else if (this.startInnerPosition.type === TemplateSlotPositionType.BeforeSlot) {
			return (this.startInnerPosition.target as TemplateSlot).getFirstNode()
		}
		else {
			return this.startInnerPosition.target as Element
		}
	}

	/** 
	 * Insert nodes before an end position.
	 * Note it will not call connect callback, you should do it manually after updated current template.
	 */
	insertNodesBefore(position: TemplateSlotPosition) {
		if (this.el) {
			position.insertBefore(...this.el.content.childNodes)
		}

		PositionMap.addPosition(this, position)
	}

	/** After nodes inserted and template updated, call connect callback. */
	callConnectCallback() {
		this.afterConnectCallback(
			PartCallbackParameter.HappenInCurrentContext
			| PartCallbackParameter.DirectNodeToMove
		)
	}

	/** 
	 * Recycle nodes that was first created in current template.
	 * Will also call disconnect callback before recycling nodes.
	 */
	async recycleNodes() {
		let position = PositionMap.getPosition(this)!

		if (this.el) {
			await this.beforeDisconnectCallback(
				PartCallbackParameter.HappenInCurrentContext
				| PartCallbackParameter.DirectNodeToMove
			)

			let firstNode = this.getFirstNode()
			if (firstNode) {
				for (let node of position.walkNodesForwardUntil(firstNode)) {
					this.el.prepend(node)
				}
			}
		}

		PositionMap.deletePosition(this, position)
	}
}