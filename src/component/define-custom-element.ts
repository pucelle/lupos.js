import type {Component} from './component'
import {hasComponentFromElement} from './from-element'
import {ComponentStyle} from './style'


/** Constructor of component. */
interface ComponentConstructor {
	style: ComponentStyle | null
	new(...args: any[]): Component
}

/** Map custom element property to component property. */
type PropertyMapOf<T extends ComponentConstructor> = Record<string, keyof InstanceType<T> | [keyof InstanceType<T>, PropertyFormatter]>
type PropertyFormatter = (value: string) => any


/** To cache `custom element name -> component constructor` */
const CustomElementConstructorMap: Map<string, {Com: ComponentConstructor, propertyMap: PropertyMapOf<ComponentConstructor>}> = new Map()


/**
 * Defines a custom element which will initialize specified component.
 * 
 * Note normally only when working with pure HTML codes,
 * you should define an custom element for initializing a component there.
 * Otherwise just reference a component in a template or new it directly.
 * 
 * - `name`: The custom element name.
 * - `Com`: The Component class constructor.
 * - `propertyMap`: A map, which's key is custom element attribute name,
 * 	  and value is component property, or `[component property, formatter]`.
 *    Frequently used formatters can be `Number`, `String`, `JSON.parse`.
 */
export function defineCustomElement<T extends ComponentConstructor>(name: string, Com: T, propertyMap: PropertyMapOf<T> = {}) {
	if (!name.includes('-')) {
		throw new Error(`"${name}" can't be defined as custom element name, which must contain "-"!`)
	}

	CustomElementConstructorMap.set(name, {Com: Com, propertyMap})
	defineCallbacks(name)
}


/** Defines custom element's connect and disconnect actions. */
function defineCallbacks(name: string) {
	customElements.define(name, class FlitElement extends HTMLElement {

		// Although W3C Spec says connect callback will not be called when inserting an element to a document fragment,
		// but I still find it is occurred sometimes.
		connectedCallback() {
			onConnected(this)
		}

		// Note moving or removing element from its parent will dispatch disconnected callback each time.
		disconnectedCallback() {
			onDisconnected(this)
		}
	})
}


/** Enqueue connection for an element. */
function onConnected(el: HTMLElement) {

	// Component instance is created.
	if (hasComponentFromElement(el)) {
		return
	}

	let {Com, propertyMap} = CustomElementConstructorMap.get(el.localName)!
	let props = makeProperties(el, propertyMap)

	new Com(el, props)
}


/** Make a property parameter for initializing component. */
function makeProperties(el: HTMLElement, propertyMap: PropertyMapOf<any>): Record<PropertyKey, any> {
	let props: Record<PropertyKey, any> = {}

	for (let [attr, prop] of Object.entries(propertyMap)) {
		let value = el.getAttribute(attr)
		if (value === null) {
			continue
		}

		if (Array.isArray(prop)) {
			props[prop[0]] = prop[1](value)
		}
		else {
			props[prop] = value
		}
	}

	return props
}


/** Enqueue disconnection for an element. */
function onDisconnected(el: HTMLElement) {
	
}

