import type {Component} from './component'


/** To cache `element -> component` map. */
const ElementComponentMap: WeakMap<Element, Component> = new WeakMap()


/** Add an `element -> component` map. */
export function addElementComponentMap(el: Element, com: Component) {
	ElementComponentMap.set(el, com)
}


/** Get component instance from an element. */
export function getComponentFromElement(el: Element): Component | null {
	return ElementComponentMap.get(el) || null
}


/** Check whether an component instance exist at an element. */
export function hasComponentFromElement(el: Element): boolean {
	return ElementComponentMap.has(el)
}
