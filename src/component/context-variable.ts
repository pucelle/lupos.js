import {WeakDoubleKeysMap} from '@pucelle/ff'
import {Component} from './component'


/** 
 * Decorate a class property to declare a context variable,
 * this property can be shared with all descendant components,
 * just after descendant components declare `@useContext property`.
 */
export declare function setContext(target: any, property: string): void

/** 
 * Decorate a class property to reference a context variable,
 * this property was declared by any level of ancestral components
 * use `@setContext property`.
 */
export declare function useContext(target: any, property: string): void


/** 
 * Cache contextual variables of a component,
 * second key is the variable property name,
 * and the value is the source component where declare this property.
 */
export const ContextVariableUnionMap: WeakDoubleKeysMap<Component, PropertyKey, Component> = new WeakDoubleKeysMap()

/** After a source component connected, cache all it's context variables declare by `@setContext`. */
export function addContextVariable(com: Component, prop: PropertyKey) {
	ContextVariableUnionMap.set(com, prop, com)
}

/** 
 * Get source component where declares `@setContext prop`,
 * from it's descendant component which declares `@useContext prop`.
 */
export function getContextVariableDeclared(com: Component, prop: PropertyKey): Component | undefined {
	let source = ContextVariableUnionMap.get(com, prop)
	if (source) {
		return (source as any)[prop]
	}

	source = findContextVariableDeclared(com, prop)
	if (source) {
		ContextVariableUnionMap.set(com, prop, source)
		return source
	}

	return undefined
}

/** Find source component where declares `@setContext prop`. */
function findContextVariableDeclared(com: Component, prop: PropertyKey): Component | undefined {
	let el: Element | null = com.el.parentElement

	while (el) {
		let com = Component.from(el)
		if (com) {
			let source = ContextVariableUnionMap.get(com, prop)
			if (source) {
				return source
			}

			return com
		}

		el = el.parentElement
	}

	return undefined
}

/** After component disconnected, delete it's context variables. */
export function deleteContextVariables(com: Component): any {
	ContextVariableUnionMap.deleteOf(com)
}