import { SlotPosition, SlotEndOuterPositionType } from './slot-position';
import { Template } from './template';
import { Part, PartCallbackParameterMask } from '../part';
/**
 * Represents the type of the contents that can be included
 * in a template literal like `<tag>${...}<.tag>`.
 */
export declare const enum SlotContentType {
    TemplateResult = 0,
    TemplateResultList = 1,
    Text = 2,
    Node = 3
}
/**
 * A `TemplateSlot` locate a slot position `>${...}<` inside a template  literal,
 * it helps to update content of the slot.
 * Must know the content type of slot, otherwise use `DynamicTypedTemplateSlot`.
 */
export declare class TemplateSlot<T extends SlotContentType | null = SlotContentType> implements Part {
    /**
     * Indicates whether connected to document.
     * Can also avoid calls content connect actions twice in update logic and connect callback.
     */
    connected: boolean;
    /** End outer position, indicates where to put new content. */
    readonly endOuterPosition: SlotPosition<SlotEndOuterPositionType>;
    private contentType;
    private readonly knownContentType;
    private content;
    constructor(endOuterPosition: SlotPosition<SlotEndOuterPositionType>, knownType?: T | null);
    afterConnectCallback(param: PartCallbackParameterMask | 0): void;
    beforeDisconnectCallback(param: PartCallbackParameterMask | 0): Promise<void> | void;
    /** Whether has some real content rendered. */
    hasContent(): boolean;
    /**
     * Update by value parameter after known it's type.
     * Note value must be strictly of the content type specified.
     */
    update(value: unknown): void;
    /** Identify content type by value. */
    private identifyContentType;
    /** Clear current content, reset content and content type. */
    private clearContent;
    /** Update from a template result. */
    private updateTemplateResult;
    /** Update from a template result list. */
    private updateTemplateResultList;
    /** Insert a template before another one. */
    private insertTemplate;
    /** Remove a template. */
    private removeTemplate;
    /** Update from a text-like value. */
    private updateText;
    /** Update from a node. */
    private updateNode;
    /**
     * Update external template manually without comparing template maker.
     * Use this when template is been managed and cached outside.
     * Note it will still connect target template if needed.
     */
    updateExternalTemplate(newT: Template | null, values: any[]): void;
    /**
     * Update external template list manually without comparing template maker.
     * Use this when template list is been managed and cached outside.
     * Note it will not connect target template list.
     */
    updateExternalTemplateList(list: Template[]): void;
}
