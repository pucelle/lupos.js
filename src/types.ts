/** Values of Part Callback Parameter. */
export enum PartCallbackParameter {

	/** If nodes of current part has been inserted or removed within current context, this value is unioned. */
	HappenInCurrentContext = 1,

	/** If nodes of current part will be directly inserted or removed, this value is unioned. */
	DirectlyMoveNodes = 2,

	/** 
	 * If nodes of current part has been removed immediately, no need to play transition any more.
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
	 * After nodes or any ancestral nodes of current part were inserted into a context.
	 * Will also broadcast calling recursively for all descendant parts.
	 * - `param`: AND byte operate of whether `HappenInCurrentContext` and whether `DirectlyMoveNodes`.
	 */
	afterConnectCallback(param: number): void

	/** 
	 * Before nodes or any ancestral nodes of current part are going to be removed from a context.
	 * Will also broadcast calling recursively for all descendant parts.
	 * - `param`: AND byte operate of whether `HappenInCurrentContext` and whether `DirectlyMoveNodes`.
	 */
	beforeDisconnectCallback(param: number): Promise<void>
}