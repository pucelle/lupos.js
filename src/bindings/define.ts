/** Constructor of all Binding class. */
interface BindingConstructor {
	new (el: Element, context?: any, modifiers?: string[]): Binding
}

/** Infer binding constructor update method parameters. */
type InferUpdateParameters<C extends BindingConstructor> =
	InstanceType<C> extends {update: (...args: infer P) => any} ? P : any

	
/** Binding interface, all binding class should implement it. */
export interface Binding {

	/** Update binding parameters to element. */
	update(value: any, ...args: any[]): void

	/** 
	 * Remove current binding and clear properties assigned to element before.
	 * Note it can only be called when removing the binding directly,
	 * Not called when attached element get removed.
	 */
	remove(): void
}


/** Cache all defined binding classes. */
const DefinedNamedBindingMap: Map<string, BindingConstructor> = new Map()


/**
 * Define a binding class which with bind to an element and
 * help to modify it's attributes or properties.
 * Use it like `<... :bindName=${...}>`.
 */
export function defineNamedBinding(name: string, Binding: BindingConstructor) {
	if (DefinedNamedBindingMap.has(name)) {
		console.warn(`You are trying to overwrite binding definition "${name}"`)
	}

	DefinedNamedBindingMap.set(name, Binding)
}


/**
 * Define a binding class which with bind to an element and
 * help to modify it's attributes or properties.
 * Returns a binding function, call which will generate a `BingingResult`.
 * Use it like `<... ${bindingFn(...)}>`.
 */
export function defineFuncBinding<B extends BindingConstructor>(Binding: B): InferUpdateParameters<B> {
	return function(...args: any[]) {
		return new BindingResult(Binding, ...args)
	} as any
}


/** 
 * Returned from calling defined binding functions.
 * Used to cache constructor and parameters to replace or update a binding instance.
 */
export class BindingResult<A extends any[] = any[]> {

	readonly cons: BindingConstructor
	readonly args: A

	constructor(name: BindingConstructor, ...args: A) {
		this.cons = name
		this.args = args
	}
}
