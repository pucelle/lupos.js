import { CompiledTemplateResult, TemplateSlot } from '../template';
/**
 * The render function to render each item,
 * pass it directly from original template.
 * This must be a fixed function, or it would can't be optimized.
 */
type ForBlockRenderFn = (item: any, index: number) => CompiledTemplateResult;
/**
 * Make it by compiling:
 * ```html
 * 	<lu:for ${...}>${(item) => html`
 * 		...
 * 	`}</lu:for>
 * ```
 */
export declare class ForBlock<T = any> {
    readonly slot: TemplateSlot;
    readonly context: any;
    private renderFn;
    private data;
    private templates;
    constructor(slot: TemplateSlot);
    /** Update render function. */
    updateRenderFn(renderFn: ForBlockRenderFn): void;
    /** Update data items. */
    updateData(data: Iterable<T>): void;
    private getItemAtIndex;
    private createTemplate;
    private leaveTemplate;
    private reuseTemplate;
    private removeTemplate;
    private moveTemplate;
    private insertTemplate;
}
export {};
