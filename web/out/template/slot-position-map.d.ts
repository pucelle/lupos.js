import { Template } from './template';
import { SlotPosition } from './slot-position';
/**
 * Cache where a template slot inserted,
 * and also update this position after new template insert into same position.
 */
export declare class SlotPositionMap {
    /**
     * Template <=> position just after it.
     * It's equivalent to a double linked list.
     * Can also use `TwoWayMap`, but use two maps independently can avoid some useless operations.
     */
    private tpMap;
    private ptMap;
    /** After insert a template before a position, remember relative position. */
    addPosition(template: Template<any>, position: SlotPosition): void;
    /** Get template position, the position where template located before. */
    getPosition(template: Template<any>): SlotPosition | undefined;
    /** Delete a template and it's cached position. */
    deletePosition(template: Template<any>, position: SlotPosition): void;
}
