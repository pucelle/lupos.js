/** Constructor of all Binding class. */
export interface BindingConstructor {

	/** 
	 * When defining a binding, we suggest to declare type of `modifiers`
	 * to the enum of each modifer string, like `('mod1' | 'mod2')[]`.
	 */
	new (el: Element, context?: any, modifiers?: string[]): Binding
}

/** Binding interface, all binding class should implement it. */
export interface Binding extends Partial<Part> {

	/** 
	 * Update binding parameters.
	 * If not provide, means no need to update.
	 */
	update?: (value: any, ...args: any[]) => void
}


/** Cache all defined named binding classes. */
const DefinedNamedBindingMap: Map<string, BindingConstructor> = new Map()


/**
 * Define a named binding which bind to an element and
 * help to modify it's attributes or properties.
 * Use it like `<... :bindingName=${...}>`.
 * 
 * Normally you should only define frequently used binding as named binding,
 * or for avoiding variable name conflicts like `:class`.
 * Named binding works globally, no need to import to local.
 * 
 * Compiler will compile `:class` to import `ClassBinding` directly,
 * so this will be removed by tree-shaking.
 * That's why it is not been exported.
 */
export function defineNamedBinding(name: string, Binding: BindingConstructor) {
	if (DefinedNamedBindingMap.has(name)) {
		console.warn(`You are trying to overwrite binding definition "${name}"`)
	}

	DefinedNamedBindingMap.set(name, Binding)
}
