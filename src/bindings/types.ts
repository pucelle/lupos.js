/** Constructor of all Binding class. */
export interface BindingConstructor {

	/** 
	 * When defining a binding class, we suggest to declare type of `modifiers`
	 * to the enum of each modifier string, like `('mod1' | 'mod2')[]`.
	 */
	new (el: Element, context?: any, modifiers?: string[]): Binding
}

/** 
 * Binding interface, all binding classes should implement it.
 * If binding class need to implement `Part` to program connect and disconnect callback,
 * it must implement both methods of `Part`.
 * 
 * When defining a binding class, the class name is important.
 * like `class StyleBinding` will be referenced as `:style`.
 */
export interface Binding {

	/** 
	 * Update binding parameters.
	 * If not provide, means no need to update.
	 */
	update?: (value: any) => void
}
