import {untilUpdateComplete} from '@pucelle/ff'


/** Values of Part Callback Parameter. */
export enum PartCallbackParameterMask {

	/** 
	 * If current part to be connected or disconnected from current context,
	 * but not because follow current context, this value is unioned.
	 * 
	 * Note when first time initialize, this value is not included.
	 * 
	 * E.g., `<lu:if {...}><div :binding />...`
	 * - after `<lu:if>` state change, for `:binding`, it connects or disconnects "MoveFromOwnStateChange".
	 * - But if the whole context get connected or disconnect,
	 *   the `:binding` do same action follows it, then it's not "MoveFromOwnStateChange".
	 */
	MoveFromOwnStateChange = 1,

	/** 
	 * If nodes of current part will be inserted or removed directly from their parent,
	 * this value is unioned.
	 * 
	 * E.g., `<lu:if {...}><div :transition><div :transition>...`.
	 * The first transition can play after `<lu:if>` state change because it is "AsDirectNodeToMove" .
	 * The second transition can't play after `<lu:if>` state change because it is not directly moved.
	 */
	MoveAsDirectNode = 2,

	/** 
	 * If nodes of current context will be inserted or removed directly from their parent,
	 * this value is unioned.
	 * 
	 * E.g., `<lu:if {...}><Com :transition>...`.
	 * `<Com>` will pass this parameter to content slot after `<lu:if>` state change.
	 */
	MoveAsContextNode = 4,

	/** 
	 * If nodes of current part has been moved immediately,
	 * this value is unioned.
	 * 
	 * E.g., if any ancestral element was removed directly,
	 * no transition needs to be played.
	 * 
	 * Or connect manually immediately, and no transition needs to be played too.
	 */
	MoveImmediately = 8,
}


/** 
 * Component, TemplateSlot, Template, partial Bindings implement it.
 * If a binding needs to implement `Part`, must implement both methods.
 */
export interface Part {

	/** 
	 * After nodes or any ancestral nodes of current part were inserted into document.
	 * 
	 * For component as a part, all data has been assigned,
	 * component has been enqueued to update, but hasn't been updated.
	 * All child parts haven't been updated too.
	 * 
	 * For other parts, the part has been totally updated already,
	 * and all child parts (exclude component) has been updated.
	 * 
	 * If part was moved to another place, would not call this connect callback.
	 * 
	 * Will also broadcasted calls connect callback recursively for all descendant parts.

	 * - `param`: AND byte operate of `PartCallbackParameterMask`.
	 */
	afterConnectCallback(param: PartCallbackParameterMask | 0): void

	/** 
	 * Before nodes or any ancestral nodes of current part are going to be removed.
	 * 
	 * Will also broadcast calling recursively for all descendant parts.
	 * 
	 * - `param`: AND byte operate of `PartCallbackParameterMask`.
	 */
	beforeDisconnectCallback(param: PartCallbackParameterMask | 0): Promise<void> | void
}

/** Type of part position. */
export enum PartPositionType {

	/** All other nodes. */
	Normal = 0,

	/** Use direct child node (not grandchild or other descendants) of template. */
	DirectNode = 1,

	/** Use context node. */
	ContextNode = 2,
}


/** Get content slot parameter from component callback parameter. */
export function getComponentSlotParameter(param: PartCallbackParameterMask | 0): PartCallbackParameterMask | 0 {

	// Replace as direct node to as context node.
	if (param & PartCallbackParameterMask.MoveAsDirectNode) {
		param &= ~PartCallbackParameterMask.MoveAsDirectNode
		param |= PartCallbackParameterMask.MoveAsContextNode
	}

	// Remove `StrayFromContext`.
	param &= ~PartCallbackParameterMask.MoveFromOwnStateChange
	
	return param
}


/** Get part callback parameter by template callback parameter and part position. */
export function getTemplatePartParameter(param: PartCallbackParameterMask | 0, position: PartPositionType): PartCallbackParameterMask | 0 {

	// Removes byte if not match part position.
	if (param & PartCallbackParameterMask.MoveAsDirectNode) {
		if (position !== PartPositionType.DirectNode) {
			param &= ~PartCallbackParameterMask.MoveAsDirectNode
		}
	}

	// If has `ContextNodeToMove` and match part position, add `DirectNodeToMove`.
	if (param & PartCallbackParameterMask.MoveAsContextNode) {
		param &= ~PartCallbackParameterMask.MoveAsContextNode

		if (position === PartPositionType.ContextNode) {
			param |= PartCallbackParameterMask.MoveAsDirectNode
		}
	}

	return param
}


/** Held part callback parameters. */
const HeldPartCallbackParameters: Map<Part, PartCallbackParameterMask | 0> = new Map()

let enqueuedShortHeldClean = false

/** Clean held part callback parameters after updating complete. */
function cleanShortHeldPartCallbackParameters() {
	HeldPartCallbackParameters.clear()
	enqueuedShortHeldClean = false
}


/** 
 * Hold part callback parameters because may update later and then do connect. */
export function holdConnectCallbackParameter(part: Part, param: PartCallbackParameterMask | 0) {
	HeldPartCallbackParameters.set(part, param)

	if (!enqueuedShortHeldClean) {
		untilUpdateComplete().then(cleanShortHeldPartCallbackParameters)
		enqueuedShortHeldClean = true
	}
}


/** 
 * Check whether a part held callback parameter.
 * If true, means it get pipe from an outer component, and will call connect callback recursively soon.
 * If false, means current part is getting update normally.
 */
export function hasConnectCallbackParameter(part: Part): boolean {
	return HeldPartCallbackParameters.has(part)
}


/** Knows a part held callback parameter, and union more parameter. */
export function unionConnectCallbackParameter(part: Part, value: PartCallbackParameterMask) {
	let existingValue = HeldPartCallbackParameters.get(part)!
	HeldPartCallbackParameters.set(part, existingValue | value)
}


/** It delegate a part, and this part itself may be deleted or appended again. */
export class PartDelegator implements Part {

	private part: Part | null = null
	private connected: boolean = false

	update(part: Part | null) {
		if (this.part === part) {
			return
		}

		if (this.connected) {
			if (this.part) {
				this.part.beforeDisconnectCallback(PartCallbackParameterMask.MoveFromOwnStateChange | PartCallbackParameterMask.MoveAsDirectNode)
			}

			if (part) {
				part.afterConnectCallback(PartCallbackParameterMask.MoveFromOwnStateChange | PartCallbackParameterMask.MoveAsDirectNode)
			}
		}

		this.part = part
	}

	afterConnectCallback(param: PartCallbackParameterMask | 0) {
		if (this.part) {
			this.part.afterConnectCallback(param)
		}

		this.connected = true
	}

	beforeDisconnectCallback(param: PartCallbackParameterMask | 0) {
		if (this.part) {
			this.part.beforeDisconnectCallback(param)
		}

		this.connected = false
	}
}