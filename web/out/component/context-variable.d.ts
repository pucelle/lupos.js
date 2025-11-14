import { InternalWeakPairKeysMap } from '../structs/map-weak';
import { Component } from './component';
/**
 * Cache contextual variables of a component,
 * second key is the variable property name,
 * and the value is the source component where declare this property.
 */
export declare const ContextVariableUnionMap: InternalWeakPairKeysMap<Component, PropertyKey, Component>;
export declare function setContextVariable(com: Component, prop: PropertyKey): void;
export declare function getContextVariableDeclared(com: Component, prop: PropertyKey): Component | undefined;
export declare function deleteContextVariables(com: Component): any;
