import { ComponentConstructor } from './types';
/** Map custom element property to component property. */
type PropertyMapOf<T extends ComponentConstructor> = Record<string, keyof InstanceType<T> | [keyof InstanceType<T>, PropertyFormatter]>;
/** Format an element property to a component property. */
type PropertyFormatter = (value: string) => any;
/**
 * Defines a custom element which will initialize specified component.
 * @param name The custom element name.
 * @param Com The Component class constructor.
 * @param propertyMap A map, which's key is custom element attribute name, and value is component property,
 *   or `[component property, formatter]`. Frequently used formatters can be `Number`, `String`, `JSON.parse`.
 *
 * Note normally only when working with pure HTML codes,
 * you should define an custom element for initializing a component there.
 * Otherwise just refer a component in a template or new it directly.
 *
 * Defining custom elements gains an additional benefit:
 * - the component will be automatically `connect` or `disconnected`
 *   after the element was connected or disconnected from document.
 */
export declare function defineCustomElement<T extends ComponentConstructor>(name: string, Com: T, propertyMap?: PropertyMapOf<T>): void;
export {};
