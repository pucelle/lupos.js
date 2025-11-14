import { getComponentByElement } from "./from-element.js";
import { trackSet } from "@pucelle/lupos";
/** To cache `custom element name -> component constructor` */
const CustomElementConstructorMap = /*#__PURE__*/ new Map();
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
export function defineCustomElement(name, Com, propertyMap) {
    if (!name.includes('-')) {
        throw new Error(`"${name}" can't be defined as custom element name, which must contain "-"!`);
    }
    CustomElementConstructorMap.set(name, { Com, propertyMap });
    defineCallbacks(name);
}
/** Defines custom element's connect and disconnect callbacks. */
function defineCallbacks(name) {
    customElements.define(name, class LuposElement extends HTMLElement {
        // W3C Spec says connect callback will not be called when inserting an element to a document fragment,
        // but I still find it is occurred sometimes.
        connectedCallback() {
            onConnected(this);
        }
        // Note moving or removing element from its parent will dispatch disconnected callback each time.
        disconnectedCallback() {
            onDisconnected(this);
        }
    });
}
/** Connect callback of custom element. */
function onConnected(el) {
    let com = getComponentByElement(el);
    // Component instance isn't created.
    if (!com) {
        let { Com, propertyMap } = CustomElementConstructorMap.get(el.localName);
        com = new Com(el);
        if (propertyMap) {
            let props = makeProperties(el, propertyMap);
            Object.assign(com, props);
            trackSet(com, "");
        }
    }
    com.afterConnectCallback(2 /* PartCallbackParameterMask.AsDirectNode */);
}
/** Make a property parameter for initializing component. */
function makeProperties(el, propertyMap) {
    let props = {};
    for (let [attr, prop] of Object.entries(propertyMap)) {
        let value = el.getAttribute(attr);
        if (value === null) {
            continue;
        }
        if (Array.isArray(prop)) {
            props[prop[0]] = prop[1](value);
        }
        else {
            props[prop] = value;
        }
    }
    return props;
}
/** Disconnect callback of custom element. */
function onDisconnected(el) {
    let com = getComponentByElement(el);
    if (com && com.connected) {
        com.beforeDisconnectCallback(2 /* PartCallbackParameterMask.AsDirectNode */
            | 8 /* PartCallbackParameterMask.MoveImmediately */);
        console.warn(`Suggest you DON'T remove custom element directly, which will cause disconnect action cant work as expected! but remove component instead.`, 'CustomElementDisconnectActionWarning');
    }
}
