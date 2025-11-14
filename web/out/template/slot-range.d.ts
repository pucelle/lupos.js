/**
 * Locate the start and end position of a node range.
 * So later can pick nodes within the range and move them.
 *
 * Use it to remember rest slot range.
 * Compiler may need to insert a comment node in the end
 * to make the end inner node stable, and avoid breaking the
 * range after contents of component-itself appended.
 */
export declare class SlotRange {
    private startInnerNode;
    private endInnerNode;
    constructor(startInnerNode: ChildNode, endInnerNode: ChildNode);
    /** Walk nodes in the range. */
    walkNodes(): Iterable<ChildNode>;
}
