/** Constructor of all Binding class. */
export interface BindingConstructor {
	new (el: Element, context?: any, modifiers?: string[]): Binding
}

/** Infer binding constructor update method parameters. */
type InferUpdateParameters<C extends BindingConstructor> =
	InstanceType<C> extends {update: (...args: infer P) => any} ? P : any


/** Binding interface, all binding class should implement it. */
export interface Binding {

	/** Update binding parameters. */
	update(value: any, ...args: any[]): void

	/** 
	 * Remove current binding and clear properties assigned to element before.
	 * Note it can only be called when removing the binding directly,
	 * Not called when attached element get removed.
	 */
	remove(): void
}

/** Return from defining a binding class. */
type BindingFn<A extends any[]> = (...args: A) => BindingResult


/** Cache all defined named binding classes. */
const DefinedNamedBindingMap: Map<string, BindingConstructor> = new Map()

/** Cache all defined binding classes. */
const DefinedBindingMap: Map<BindingFn<any>, BindingConstructor> = new Map()


/**
 * Define a named binding which bind to an element and
 * help to modify it's attributes or properties.
 * Use it like `<... :bindingName=${...}>`.
 * 
 * Normally you should only define frequently used binding as named binding,
 * or for avoiding variable name conflicts like `:class`.
 * Named binding works globally, no need to import to local, so codes cant be shaked out.
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



/**
 * Define a binding class which bind to an element and
 * help to modify it's attributes or properties.
 * Returns a binding function, call which will generate a `BingingResult`.
 * Use it like `<... :bindingFn=${(...)}>`
 * or `<... ${bindingFn(...)}>` when you may want to toggle this binding, or transfer several parameters.
 * 
 * Not like named binding, you must import `bindingFn`.
 * Note uses `defineBinding` cause executing codes in top level,
 * so you may need to set `sideEffects: false` to make tree shaking work as expected.
 */
export function defineBinding<B extends BindingConstructor>(Binding: B): BindingFn<InferUpdateParameters<B>> {
	let fn = function(...args: any[]) {
		return new BindingResult(Binding, ...args)
	} as any

	DefinedBindingMap.set(fn, Binding)

	return fn
}


/** Get defined binding class by name. */
export function getBinding(bindingFn: BindingFn<any>): BindingConstructor {
	return DefinedBindingMap.get(bindingFn)!
}


/** 
 * Returned from calling defined binding functions.
 * Used to cache constructor and parameters to replace or update a binding instance.
 */
export class BindingResult {

	readonly cons: BindingConstructor
	readonly args: any[]

	constructor(name: BindingConstructor, ...args: any[]) {
		this.cons = name
		this.args = args
	}
}
