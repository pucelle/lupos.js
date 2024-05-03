/** Values of Part Callback Parameter. */
export enum PartCallbackParameter {

	/** 
	 * If current part will be connected or disconnected from current context,
	 * this value is unioned.
	 * 
	 * E.g., `<if {...}><div :binding /><ChildCom />...`, after `<if>` state change.
	 * - for `:binding`, the source of connect or disconnect action "HappenInCurrentContext".
	 * - for `<ChildCom>`, the source of connect or disconnect action happen in parent context.
	 */
	HappenInCurrentContext = 1,

	/** 
	 * If nodes of current part will be inserted or removed directly from their parent,
	 * this value is unioned.
	 * 
	 * E.g., `<if {...}><div :transition>...`,
	 * the transition can play after `<if>` state change because `div` is "DirectNodeToMove" .
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
 * Component, TemplateSlot, Template, partial Binding implement it.
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

	 * - `param`: AND byte operate of `PartCallbackParameter`.
	 */
	afterConnectCallback(param: number): void

	/** 
	 * Before nodes or any ancestral nodes of current part are going to be removed.
	 * 
	 * Will also broadcast calling recursively for all descendant parts.
	 * 
	 * - `param`: AND byte operate of `PartCallbackParameter`.
	 */
	beforeDisconnectCallback(param: number): Promise<void> | void
}