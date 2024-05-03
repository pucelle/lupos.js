import {SlotPosition, SlotStartInnerPositionType, SlotPositionType} from './slot-position'
import {TemplateSlot} from './template-slot'
import {TemplateMaker, TemplateInitResult} from './template-maker'
import {noop} from '@pucelle/ff'
import {Part, PartCallbackParameter} from '../types'
import {SlotPositionMap} from './slot-position-map'


/** Help to cache template insert position. */
const PositionMap = new SlotPositionMap()


/** 
 * Represents a template make from a html`...`
 * Be generated after a `TemplateMaker` binded with a context.
 */
export class Template<P extends any[] = any[]> implements Part {

	readonly el: HTMLTemplateElement
	readonly maker: TemplateMaker | null
	readonly startInnerPosition: SlotPosition<SlotStartInnerPositionType>
	readonly update: (values: P) => void
	private readonly parts: [Part, number][]

	/** 
	 * Required, can avoid call connect callbacks repeatedly.
	 * 
	 * E.g.,
	 * A template1 was updated, cause slot to append template2,
	 * template2 was updated and connected, call template1 connect callback,
	 * cause template1's connect callback to be called repeatedly.
	 */
	private connected: boolean = false

	constructor(maker: TemplateMaker | null, initResult: TemplateInitResult) {
		this.maker = maker

		this.el = initResult.el
		this.startInnerPosition = initResult.position
		this.parts = initResult.parts || []
		this.update = initResult.update || noop
	}

	afterConnectCallback(param: number) {
		if (this.connected) {
			return
		}

		this.connected = true

		for (let [part, partParam] of this.parts) {
			part.afterConnectCallback(param & partParam)
		}
	}

	beforeDisconnectCallback(param: number): Promise<void> | void {
		if (!this.connected) {
			return
		}

		this.connected = false

		let promises: Promise<void>[] = []

		for (let [part, topLevel] of this.parts) {
			let p = part.beforeDisconnectCallback(param & topLevel)
			if (p) {
				promises.push(p)
			}
		}

		if (promises.length > 0) {
			return Promise.all(promises) as Promise<any> 
		}
	}

	/** 
	 * Get last node of the contents in current slot.
	 * If have no fixed nodes, return last node of previois slot.
	 * Can only get when nodes exist in current template.
	 */
	getFirstNode(): ChildNode | null {
		if (!this.startInnerPosition) {
			return null
		}
		else if (this.startInnerPosition.type === SlotPositionType.Before) {
			return this.startInnerPosition.target as ChildNode
		}
		else if (this.startInnerPosition.type === SlotPositionType.BeforeSlot) {
			return (this.startInnerPosition.target as TemplateSlot).getStartNode()
		}
		else {
			return this.startInnerPosition.target as Element
		}
	}

	/** 
	 * Insert nodes before an end position.
	 * Note it will not call connect callback, you should do it manually after updated current template.
	 */
	insertNodesBefore(position: SlotPosition) {
		position.insertNodesBefore(...this.el.content.childNodes)
		PositionMap.addPosition(this, position)
	}

	/** 
	 * Recycle nodes that was firstly created in current template.
	 * Will also call disconnect callback before recycling nodes.
	 */
	async recycleNodes() {
		await this.beforeDisconnectCallback(
			PartCallbackParameter.HappenInCurrentContext
			| PartCallbackParameter.DirectNodeToMove
		)

		// Note here postpone recycling nodes for at least a micro task tick.
		let position = PositionMap.getPosition(this)!
		let firstNode = this.getFirstNode()

		if (firstNode) {
			this.el.content.append(...position.walkNodesFrom(firstNode))
		}

		PositionMap.deletePosition(this, position)
	}

	/** 
	 * Move nodes that was first created in current template,
	 * and already inserted a position, to before a new position.
	 */
	moveNodesBefore(position: SlotPosition) {
		let oldPosition = PositionMap.getPosition(this)!
		if (oldPosition === position) {
			return
		}

		let firstNode = this.getFirstNode()
		if (firstNode) {
			position.insertNodesBefore(...oldPosition.walkNodesFrom(firstNode))
		}

		PositionMap.deletePosition(this, oldPosition)
		PositionMap.addPosition(this, position)
	}
}