import {SlotPosition, SlotStartInnerPositionType, SlotPositionType} from './slot-position'
import {TemplateMaker, TemplateInitResult} from './template-maker'
import {noop} from '@pucelle/ff'
import {Part, PartCallbackParameterMask} from '../types'
import {SlotPositionMap} from './slot-position-map'


/** 
 * Help to cache template insert positions,
 * Especially manage positions when template insert and delete dynamically.
 */
const PositionMap = new SlotPositionMap()


/** Represents a template make from a template literal html`...` bind with a context. */
export class Template<A extends any[] = any[]> implements Part {

	readonly el: HTMLTemplateElement
	readonly maker: TemplateMaker | null
	readonly startInnerPosition: SlotPosition<SlotStartInnerPositionType>
	readonly update: (values: A) => void
	private readonly parts: Part[] | (() => Part[])

	/** 
	 * Required, can avoid call connect callbacks repeatedly.
	 * 
	 * E.g.,
	 * - template1 was updated, cause inner slot to append template2.
	 * - template2 was updated and connected.
	 * - call template1 connect callback.
	 * - cause template2's connect callback to be called repeatedly.
	 */
	private connected: boolean = false
	
	/** 
	 * If `maker` is `null`, normally create template from `new Template(...)`,
	 * not `Maker.make(...)`. then can only update by `slot.updateTemplateOnly(...)`.
	 */
	constructor(initResult: TemplateInitResult, maker: TemplateMaker | null = null) {
		this.maker = maker

		this.el = initResult.el
		this.startInnerPosition = initResult.position
		this.parts = initResult.parts ?? []
		this.update = initResult.update ?? noop
	}

	afterConnectCallback(param: PartCallbackParameterMask) {
		if (this.connected) {
			return
		}

		let parts = typeof this.parts === 'function' ? this.parts() : this.parts

		for (let part of parts) {
			part.afterConnectCallback(param)
		}
		
		this.connected = true
	}

	beforeDisconnectCallback(param: PartCallbackParameterMask): Promise<void> | void {
		if (!this.connected) {
			return
		}

		this.connected = false

		let promises: Promise<void>[] = []
		let parts = typeof this.parts === 'function' ? this.parts() : this.parts

		for (let part of parts) {
			let p = part.beforeDisconnectCallback(param)
			if (p) {
				promises.push(p)
			}
		}

		if (promises.length > 0) {
			return Promise.all(promises) as Promise<any> 
		}
	}

	/** 
	 * Get first node of all the contents in current template.
	 * Can only get when nodes exist in current template.
	 * If cant find a node, returns `null`.
	 */
	getFirstNode(): ChildNode | null {
		if (!this.startInnerPosition) {
			return null
		}
		else if (this.startInnerPosition.type === SlotPositionType.Before) {
			return this.startInnerPosition.target as ChildNode
		}
		else {
			return this.startInnerPosition.target as Element
		}
	}

	/** 
	 * Insert all nodes of current template before a position.
	 * Note you must ensure these nodes stay in current template, or been recycled.
	 * Will not call connect callback, you should do it manually after current template updated.
	 */
	insertNodesBefore(position: SlotPosition) {
		position.insertNodesBefore(this.el.content)
		PositionMap.addPosition(this, position)
	}

	/** 
	 * Recycle nodes that was firstly created in current template,
	 * move them back to current template.
	 * Note you must ensure these nodes have been inserted to a position.
	 * Will call disconnect callback before recycling nodes.
	 */
	async recycleNodes() {
		await this.beforeDisconnectCallback(
			PartCallbackParameterMask.HappenInCurrentContext
			| PartCallbackParameterMask.DirectNodeToMove
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
	 * Move nodes that was first created in current template, to before a new position.
	 * Note you must ensure these nodes have been inserted to a position.
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