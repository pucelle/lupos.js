
/** Component, TemplateSlot, Template, partial Binding implement it. */
interface Part {

	/** 
	 * After nodes or any ancestral nodes of current part were inserted into a context.
	 * It will also broadcast calling recursively for all descendant parts.
	 * If current part is in the top level of appended, `directly` is `1`.
	 */
	afterConnectCallback(directly: 0 | 1): void

	/** 
	 * Before nodes or any ancestral nodes of current part are going to be removed from a context.
	 * It will also broadcast calling recursively for all descendant parts.
	 * If current part is in the top level of removed, `directly` is `1`.
	 */
	beforeDisconnectCallback(directly: 0 | 1): Promise<void>
}