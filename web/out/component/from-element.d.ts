import type { Component } from './component';
/** Add an `element -> component` map after component created. */
export declare function addElementComponentMap(el: Element, com: Component): void;
/** Get component instance by an associated element. */
export declare function getComponentByElement(el: Element): Component | undefined;
/** Check whether an component associated with specified element. */
export declare function hasComponentForElement(el: Element): boolean;
