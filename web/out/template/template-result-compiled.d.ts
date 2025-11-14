import { TemplateMaker } from './template-maker';
/**
 * Compile from html`...`,
 * it only caches compiled template maker and newly generated values.
 */
export declare class CompiledTemplateResult {
    readonly maker: TemplateMaker;
    readonly values: any[];
    /**
     * Must bind original context.
     * E.g., generate by a render function in a list,
     * and get passed to a repeat component, it will bind  to the repeat.
     */
    readonly context: any;
    constructor(maker: TemplateMaker, values: any[], context: any);
    toString(): void;
}
