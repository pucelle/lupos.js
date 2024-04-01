import type {Component} from './component'


/** To cache `element -> component` map. */
const ElementComponentMap: WeakMap<HTMLElement, Component> = new WeakMap()


/** Add an `element -> component` map. */
export function addElementComponentMap(el: HTMLElement, com: Component) {
	ElementComponentMap.set(el, com)
}


/** Get component instance from an element. */
export function getComponentFromElement(el: HTMLElement): Component | null {
	return ElementComponentMap.get(el) || null
}


/** Check whether an component instance exist at an element. */
export function hasComponentFromElement(el: HTMLElement): boolean {
	return ElementComponentMap.has(el)
}
