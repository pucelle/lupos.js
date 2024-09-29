import {onComplete} from '@pucelle/ff'


/** Values of Part Callback Parameter. */
export enum PartCallbackParameterMask {

	/** 
	 * If current part will be connected or disconnected from current context,
	 * this value is unioned.
	 * 
	 * E.g., `<lupos:if {...}><div :binding /><ChildCom />...`, after `<if>` state change.
	 * - for `:binding`, the connect or disconnect action "HappenInCurrentContext".
	 * - for `<ChildCom>`, the connect or disconnect action happen in parent context.
	 */
	HappenInCurrentContext = 2 ** 0,

	/** 
	 * If nodes of current part will be inserted or removed directly from their parent,
	 * this value is unioned.
	 * 
	 * E.g., `<lupos:if {...}><div :transition><div :transition>...`.
	 * The first transition can play after if state change because it is "DirectNodeToMove" .
	 * The second transition can't play after if state change because it is not directly moved.
	 */
	DirectNodeToMove = 2 ** 1,

	/** 
	 * If nodes of current context will be inserted or removed directly from their parent,
	 * this value is unioned.
	 * 
	 * E.g., `<lupos:if {...}><Com :transition>...`.
	 * Com will pass this parameter to content slot after if state change.
	 */
	ContextNodeToMove = 2 ** 2,

	/** 
	 * If nodes of current part has been removed immediately,
	 * this value is unioned.
	 * 
	 * E.g., if any ancestral element was removed directly,
	 * no transition needs to be played any more.
	 * 
	 * Only use it for disconnect callback.
	 */
	RemoveImmediately = 2 ** 3,
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

	/** Use direct child node (not grandchild or other descendants) of template. */
	DirectNode = 0,

	/** Use context node. */
	ContextNode = 1,
	
	/** All other nodes. */
	Others = 2,
}


/** Get content slot parameter from component callback parameter. */
export function getComponentSlotParameter(param: PartCallbackParameterMask | 0): PartCallbackParameterMask | 0 {

	// Replace as direct node to as context node.
	if (param & PartCallbackParameterMask.DirectNodeToMove) {
		param &= ~PartCallbackParameterMask.DirectNodeToMove
		param |= PartCallbackParameterMask.ContextNodeToMove
	}
	
	return param
}


/** Get part callback parameter by template callback parameter and part position. */
export function getTemplatePartParameter(param: PartCallbackParameterMask | 0, position: PartPositionType): PartCallbackParameterMask | 0 {

	// Removes byte if not match part position.
	if (param & PartCallbackParameterMask.DirectNodeToMove) {
		if (position !== PartPositionType.DirectNode) {
			param &= ~PartCallbackParameterMask.DirectNodeToMove
		}
	}

	// If has `ContextNodeToMove` and match part position, add `DirectNodeToMove`.
	if (param & PartCallbackParameterMask.ContextNodeToMove) {
		param &= ~PartCallbackParameterMask.ContextNodeToMove

		if (position === PartPositionType.ContextNode) {
			param |= PartCallbackParameterMask.DirectNodeToMove
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
		onComplete(cleanShortHeldPartCallbackParameters)
		enqueuedShortHeldClean = true
	}
}


/** Get held callback parameters by a part. */
export function getConnectCallbackParameter(part: Part): PartCallbackParameterMask | 0 | undefined {
	return HeldPartCallbackParameters.get(part)
}


/** 
 * Check whether a part held callback parameter.
 * If true, means it get pipe from an outer component, and will call connect callback recursively soon.
 * If false, means current part is getting update normally.
 */
export function hasConnectCallbackParameter(part: Part): boolean {
	return HeldPartCallbackParameters.has(part)
}