/** To cache `element -> component` map. */
const ElementComponentMap = /*#__PURE__*/ new WeakMap();
/** Add an `element -> component` map after component created. */
export function addElementComponentMap(el, com) {
    ElementComponentMap.set(el, com);
}
/** Get component instance by an associated element. */
export function getComponentByElement(el) {
    return ElementComponentMap.get(el);
}
/** Check whether an component associated with specified element. */
export function hasComponentForElement(el) {
    return ElementComponentMap.has(el);
}
