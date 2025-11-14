import type {Component} from './component'


/** To cache `element -> component` map. */
const ElementComponentMap: WeakMap<Element, Component> = /*#__PURE__*/new WeakMap()


/** Add an `element -> component` map after component created. */
export function addElementComponentMap(el: Element, com: Component) {
	ElementComponentMap.set(el, com)
}


/** Get component instance by an associated element. */
export function getComponentByElement(el: Element): Component | undefined {
	return ElementComponentMap.get(el)
}


/** Check whether an component associated with specified element. */
export function hasComponentForElement(el: Element): boolean {
	return ElementComponentMap.has(el)
}
