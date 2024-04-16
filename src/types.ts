/** 
 * Values of Part Callback Parameter.
 * Never change the numeric values here.
 */
export enum PartCallbackParameter {

	/** If nodes of current part is been appended or removed in current context, this value is available. */
	HappenInCurrentContext = 1,

	/** If nodes of current part is been directly appended or removed, this value is available. */
	DirectlyMoveNodes = 2,
}


/** 
 * Component, TemplateSlot, Template, partial Binding implement it.
 * If a binding needs to implement `Part`, must implement both methods.
 */
export interface Part {

	/** 
	 * After nodes or any ancestral nodes of current part were inserted into a context.
	 * Will also broadcast calling recursively for all descendant parts.
	 * - `param`: Is the AND operate of whether `InCurrentContext` and whether `DirectlyMoveNodes`.
	 */
	afterConnectCallback(param: number): void

	/** 
	 * Before nodes or any ancestral nodes of current part are going to be removed from a context.
	 * Will also broadcast calling recursively for all descendant parts.
	 * - `param`: Is the AND operate of whether `InCurrentContext` and whether `DirectlyMoveNodes`.
	 */
	beforeDisconnectCallback(param: number): Promise<void>
}