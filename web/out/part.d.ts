/** Values of Part Callback Parameter. */
export declare const enum PartCallbackParameterMask {
    /**
     * To be connected or disconnected from some state change,
     * but not because of parent component connect or disconnect.
     *
     * E.g., for `<lu:if {...}><div :binding />...`, for `:binding`:
     * - After `<lu:if>` state change, it is true.
     * - Otherwise no matter whole component connect or disconnect, it's false.
     */
    FromOwnStateChange = 1,
    /**
     * If node will be directly inserted or removed from their parent,
     * this value is true.
     *
     * E.g., for `<lu:if {...}><div1 :transition><div2 :transition>...`, after `<lu:if>` state change:
     * `div1` can play because it is "AsDirectNode".
     * `div2` can't play because it is not "AsDirectNode".
     */
    AsDirectNode = 2,
    /**
     * If node will be inserted or removed directly from their parent,
     * and it's also a component, this value is true.
     *
     * It exists because "AsDirectNode" itself doesn't broadcast to child components,
     * but if connect or disconnect happens at an outer component, and the child component
     * itself "AsDirectNode", we should transform it to "AsDirectContextNode" and pass it to
     * this component, and inside it get transform back to "AsDirectNode" for component node.
     *
     * Use it only internally.
     */
    AsDirectContextNodeInternal = 4,
    /**
     * If nodes of current part has been connected or disconnected immediately,
     * this value is true.
     *
     * E.g., if any ancestral element was removed directly, or connect manually
     * immediately, no transition needs to be played.
     */
    MoveImmediately = 8
}
/**
 * Component, TemplateSlot, Template, partial Bindings implement it.
 * If a binding needs to implement `Part`, must implement both methods.
 */
export interface Part {
    /**
     * After node or any ancestral node of current part were inserted into document.
     *
     * For component as a part, all data has been assigned,
     * component has been enqueued to update, but hasn't been updated.
     * All child parts haven't been updated too.
     *
     * For other parts, the part has been totally updated already,
     * and all child parts (exclude component) has been updated.
     *
     * Will also broadcast connect callback recursively to all descendant parts.

     * - `param`: AND byte operate of `PartCallbackParameterMask`.
     */
    afterConnectCallback(param: PartCallbackParameterMask | 0): void;
    /**
     * Before node or any ancestral node of current part are going to be removed.
     *
     * Will also broadcast disconnect calling recursively to all descendant parts.
     *
     * - `param`: AND byte operate of `PartCallbackParameterMask`.
     */
    beforeDisconnectCallback(param: PartCallbackParameterMask | 0): Promise<void> | void;
}
/** Type of part position. */
export declare const enum PartPositionType {
    /** All other nodes. */
    Normal = 0,
    /** Use direct child node (not grandchild or other descendants) of template. */
    DirectNode = 1,
    /** Use context node. */
    ContextNode = 2
}
/** Get content slot parameter from component callback parameter. */
export declare function getComponentSlotParameter(param: PartCallbackParameterMask | 0): PartCallbackParameterMask | 0;
/** Get part callback parameter by template callback parameter and part position. */
export declare function getTemplatePartParameter(param: PartCallbackParameterMask | 0, position: PartPositionType): PartCallbackParameterMask | 0;
/** It delegate a part, and this part itself may be deleted or appended again. */
export declare class PartDelegator implements Part {
    connected: boolean;
    private part;
    update(part: Part | null): void;
    afterConnectCallback(param: PartCallbackParameterMask | 0): void;
    beforeDisconnectCallback(param: PartCallbackParameterMask | 0): void;
}
