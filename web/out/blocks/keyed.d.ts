import { CompiledTemplateResult, TemplateSlot } from '../template';
/**
 * Make it by compiling:
 * ```html
 * 	<lu:keyed ${...}>...</lu:keyed>
 * ```
 */
export declare class KeyedBlock {
    readonly slot: TemplateSlot;
    private key;
    private template;
    constructor(slot: TemplateSlot);
    update(newKey: any, result: CompiledTemplateResult | null): void;
}
/**
 * Make it by compiling:
 * ```html
 * 	<lu:keyed cache ${...}>...</lu:keyed>
 * ```
 * Note it will cache all rendered templates.
 */
export declare class CacheableKeyedBlock {
    readonly slot: TemplateSlot;
    private key;
    private template;
    private templates;
    constructor(slot: TemplateSlot);
    update(newKey: any, result: CompiledTemplateResult | null): void;
}
/**
 * Make it by compiling:
 * ```
 * 	<lu:keyed weakCache ${...}>...</lu:keyed>
 * ```
 * Note key must be an object.
 */
export declare class WeakCacheableKeyedBlock {
    readonly slot: TemplateSlot;
    private key;
    private template;
    private templates;
    constructor(slot: TemplateSlot);
    update(newKey: object, result: CompiledTemplateResult | null): void;
}
