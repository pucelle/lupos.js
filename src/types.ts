/** Values of Part Callback Parameter. */
export enum PartCallbackParameterMask {
	None = 0,

	/** 
	 * If current part will be connected or disconnected from current context,
	 * this value is unioned.
	 * 
	 * E.g., `<if {...}><div :binding /><ChildCom />...`, after `<if>` state change.
	 * - for `:binding`, the connect or disconnect action "HappenInCurrentContext".
	 * - for `<ChildCom>`, the connect or disconnect action happen in parent context.
	 */
	HappenInCurrentContext = 1,

	/** 
	 * If nodes of current part will be inserted or removed directly from their parent,
	 * this value is unioned.
	 * 
	 * E.g., `<if {...}><div :transition><div :transition>...`.
	 * The first transition can play after `<if>` state change because it is "DirectNodeToMove" .
	 * The second transition can't play after `<if>` state change because it is not directly moved.
	 */
	DirectNodeToMove = 2,

	/** 
	 * If nodes of current part has been removed immediately,
	 * this value is unioned.
	 * 
	 * E.g., if any ancestral element was removed directly,
	 * no transition needs to be played any more.
	 * 
	 * Only use it for disconnect callback.
	 */
	RemoveImmediately = 4,
}


/** 
 * Component, TemplateSlot, Template, partial Bindings implement it.
 * If a binding needs to implement `Part`, must implement both methods.
 */
export interface Part {

	/** 
	 * After nodes or any ancestral nodes of current part were inserted,
	 * and current part was totally update, call it's connect callback.
	 * 
	 * If part was moved to another place, would not call this connect callback.
	 * 
	 * Will also broadcast calling recursively for all descendant parts.

	 * - `param`: AND byte operate of `PartCallbackParameterMask`.
	 */
	afterConnectCallback(param: PartCallbackParameterMask): void

	/** 
	 * Before nodes or any ancestral nodes of current part are going to be removed.
	 * 
	 * Will also broadcast calling recursively for all descendant parts.
	 * 
	 * - `param`: AND byte operate of `PartCallbackParameterMask`.
	 */
	beforeDisconnectCallback(param: PartCallbackParameterMask): Promise<void> | void
}