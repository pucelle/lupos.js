/**
 * Contents that can be included in a `<tag>${...}<.tag>`.
 * **Do not** change the values of each enum item.
 */
export declare const enum SlotPositionType {
    /** End position collapse with end of parent container range. */
    AfterContent = 0,
    /** End position collapse with start of next sibling node. */
    Before = 1
}
export type SlotStartInnerPositionType = SlotPositionType.Before;
export type SlotEndOuterPositionType = SlotPositionType.Before | SlotPositionType.AfterContent;
/**
 * A `TemplateSlotPosition` indicates where a template slot located.
 * It try to find closest node, container, or slot for reference,
 * And helps to insert or remove contents from this position.
 */
export declare class SlotPosition<T = SlotPositionType> {
    type: T;
    target: Element | ChildNode;
    constructor(type: T, target: Element | ChildNode);
    /**
     * Get first node of the all the contents that inside of current slot.
     * Available only when current position represents a start inner position.
     */
    getStartNode(): ChildNode | null;
    /** Insert nodes before current position. */
    insertNodesBefore(...newNodes: ChildNode[]): void;
    /** Walk nodes from specified node, and until before of current position. */
    walkNodesFrom(from: ChildNode): Iterable<ChildNode>;
}
