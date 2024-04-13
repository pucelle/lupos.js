/** Constructor of all Binding class. */
export interface BindingConstructor {
	new (el: Element, context?: any, modifiers?: string[]): Binding
}

/** Binding interface, all binding class should implement it. */
export interface Binding {

	/** Update binding parameters. */
	update(value: any, ...args: any[]): void
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
 * Compiler will compile `:class` to importing `ClassBinding` directly.
 */
export function defineNamedBinding(name: string, Binding: BindingConstructor) {
	if (DefinedNamedBindingMap.has(name)) {
		console.warn(`You are trying to overwrite binding definition "${name}"`)
	}

	DefinedNamedBindingMap.set(name, Binding)
}


/** Get defined binding class by name. */
export function getNamedBinding(name: string): BindingConstructor {
	return DefinedNamedBindingMap.get(name)!
}
