import { Component, ComponentConstructor } from '../component';
import { SlotRange, TemplateSlot } from '../template';
/**
 * After compiling all the properties applied to a component,
 * and update latest component reference.
 * get this binder as a function.
 */
type DynamicComponentBinder = (com: Component) => void;
/**
 * Compiled by:
 * ```html
 * 	<${DynamicComponent}>
 * ```
 */
export declare class DynamicComponentBlock {
    readonly binder: DynamicComponentBinder;
    readonly slot: TemplateSlot;
    readonly contentRange: SlotRange | null;
    originalEl: HTMLElement | undefined;
    private Com;
    private com;
    constructor(binder: DynamicComponentBinder, originalEl: HTMLElement, slot: TemplateSlot, contentRange?: SlotRange | null);
    /** Update with new Component Constructor. */
    update(NewCom: ComponentConstructor): void;
}
export {};
