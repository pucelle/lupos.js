import { CompiledTemplateResult, TemplateSlot } from '../template';
/**
 * Make it by compiling:
 * ```html
 * 	<lu:if ${...}>...</lu:if>
 * 	<lu:elseif ${...}>...</lu:elseif>
 * 	<lu:else>...</lu:else>
 * ```
 */
export declare class IfBlock {
    readonly slot: TemplateSlot;
    constructor(slot: TemplateSlot);
    update(result: CompiledTemplateResult | null): void;
}
/**
 * Make it by compiling:
 * ```html
 * 	<lu:if ${...} cache>...</lu:if>
 * 	<lu:elseif ${...}>...</lu:elseif>
 * 	<lu:else>...</lu:else>
 * ```
 */
export declare class CacheableIfBlock {
    readonly slot: TemplateSlot;
    private templates;
    constructor(slot: TemplateSlot);
    update(result: CompiledTemplateResult | null): void;
}
