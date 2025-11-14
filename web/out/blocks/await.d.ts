import { TemplateMaker, TemplateSlot } from '../template';
/**
 * Make it by compiling:
 * ```html
 * 	<lu:await ${...}>...</lu:await>
 * 	<lu:then>...</lu:then>
 * 	<lu:catch>...</lu:catch>
 * ```
 */
export declare class AwaitBlock {
    readonly makers: (TemplateMaker | null)[];
    readonly slot: TemplateSlot;
    readonly context: any;
    private promise;
    private values;
    private template;
    constructor(makers: (TemplateMaker | null)[], slot: TemplateSlot, context: any);
    /**
     * Note update await block or resolve awaiting promise must wait
     * for a micro task tick, then template will begin to update.
     */
    update(promise: Promise<any>, values: any[]): void;
    private updateIndex;
}
