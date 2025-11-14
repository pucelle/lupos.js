import { SlotPosition, SlotStartInnerPositionType } from './slot-position';
import { TemplateMaker, TemplateInitResult } from './template-maker';
import { Part, PartCallbackParameterMask } from '../part';
import { CompiledTemplateResult } from './template-result-compiled';
/**
 * Represents a template make from a template literal html`...`,
 * and bound with a context.
 */
export declare class Template<A extends any[] = any[]> implements Part {
    /**
     * Required, a template may be appended and wait to call connect callback.
     * It may be then updated to be removed and call disconnect callback immediately.
     */
    connected: boolean;
    readonly el: HTMLTemplateElement;
    readonly maker: TemplateMaker | null;
    readonly context: any;
    readonly startInnerPosition: SlotPosition<SlotStartInnerPositionType>;
    readonly update: (values: A) => void;
    /** Part and it's position. */
    private readonly parts;
    /**
     * If `maker` is `null`, normally create template from `new Template(...)`,
     * not `Maker.make(...)`. then can only update by `slot.updateTemplateOnly(...)`.
     */
    constructor(initResult: TemplateInitResult, maker?: TemplateMaker | null, context?: any);
    /** Whether can use `result` to do update. */
    canUpdateBy(result: CompiledTemplateResult): boolean;
    afterConnectCallback(param: PartCallbackParameterMask | 0): void;
    beforeDisconnectCallback(param: PartCallbackParameterMask | 0): Promise<void> | void;
    /**
     * Get first node of all the contents in current template.
     * Can only get when nodes exist in current template.
     * If cant find a node, returns `null`.
     */
    getFirstNode(): ChildNode | null;
    /**
     * Insert all nodes of current template before a position.
     * Note you must ensure these nodes stay in current template, or been recycled.
     * Will not call connect callback, you should do it manually after current template updated.
     */
    insertNodesBefore(position: SlotPosition): void;
    /**
     * Recycle nodes that was firstly created in current template,
     * move them back to current template.
     * Note you must ensure these nodes have been inserted to a position already.
     * Will call disconnect callback before recycling nodes.
     */
    recycleNodes(): Promise<void>;
    /**
     * Move nodes that was first created in current template, to before a new position.
     * Note you must ensure these nodes have been inserted to a position.
     */
    moveNodesBefore(position: SlotPosition): void;
}
