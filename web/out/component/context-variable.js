import { InternalWeakPairKeysMap } from "../structs/map-weak.js";
import { Component } from "./component.js";
import { trackGet } from "@pucelle/lupos";
/**
 * Cache contextual variables of a component,
 * second key is the variable property name,
 * and the value is the source component where declare this property.
 */
export const ContextVariableUnionMap = /*#__PURE__*/ new InternalWeakPairKeysMap();
export function setContextVariable(com, prop) {
    ContextVariableUnionMap.set(com, prop, com);
}
export function getContextVariableDeclared(com, prop) {
    let source = ContextVariableUnionMap.get(com, prop);
    if (source) {
        trackGet(source, prop);
        return source[prop];
    }
    source = findContextVariableDeclared(com, prop);
    if (source) {
        // Also cache for current component as a bridge for external components' querying.
        ContextVariableUnionMap.set(com, prop, source);
        return source;
    }
    return undefined;
}
/** Find source component where declares `@setContext prop`. */
function findContextVariableDeclared(com, prop) {
    let el = com.el.parentElement;
    while (el) {
        let com = Component.from(el);
        if (com) {
            let source = ContextVariableUnionMap.get(com, prop);
            if (source) {
                return source;
            }
            return com;
        }
        el = el.parentElement;
    }
    return undefined;
}
export function deleteContextVariables(com) {
    ContextVariableUnionMap.deleteOf(com);
}
