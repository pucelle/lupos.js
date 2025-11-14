/**
 * A `TemplateSlotPosition` indicates where a template slot located.
 * It try to find closest node, container, or slot for reference,
 * And helps to insert or remove contents from this position.
 */
export class SlotPosition {
    type;
    target;
    constructor(type, target) {
        this.type = type;
        this.target = target;
    }
    /**
     * Get first node of the all the contents that inside of current slot.
     * Available only when current position represents a start inner position.
     */
    getStartNode() {
        if (this.type === 1 /* SlotPositionType.Before */) {
            return this.target;
        }
        else {
            return null;
        }
    }
    /** Insert nodes before current position. */
    insertNodesBefore(...newNodes) {
        if (this.type === 1 /* SlotPositionType.Before */) {
            let node = this.target;
            node.before(...newNodes);
        }
        else {
            let parent = this.target;
            parent.append(...newNodes);
        }
    }
    /** Walk nodes from specified node, and until before of current position. */
    *walkNodesFrom(from) {
        let untilBeforeNode;
        let node = from;
        if (this.type === 1 /* SlotPositionType.Before */) {
            untilBeforeNode = this.target;
        }
        else {
            untilBeforeNode = null;
        }
        do {
            yield node;
            node = node.nextSibling;
        } while (node && node !== untilBeforeNode);
    }
}
