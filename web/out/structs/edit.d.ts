/** A edit record to indicate how to process current item. */
export interface EditRecord {
    /** Current Edit type. */
    type: EditType;
    /**
     * Index of the old item if decided to use or delete it.
     * Be `-1` when inserting.
     */
    fromIndex: number;
    /**
     * Index of the new item in new item list.
     * Be `-1` when deleting.
     */
    toIndex: number;
    /**
     * Index in the old item list that need to insert item before.
     * Be `-1` when no need to do inserting.
     * Otherwise betweens `0 ~ items.length`.
     */
    insertIndex: number;
}
export declare const enum EditType {
    /**
     * Ignores, will be used later as a matched item to move or as a reuseable item to reuse.
     * Uses in internal, no need to handle it in your codes.
     */
    InternalSkip = 0,
    /**
     * Leaves it because of old item matches new item.
     * - `fromIndex`: the match item index in old item list.
     * - `toIndex`: the match item index in new item list.
     * - `insertIndex`: be `-1`.
     */
    Leave = 1,
    /**
     * Moves same item from it's old index to current index.
     * - `fromIndex`: the match item index in old item list indicates where to move from.
     * - `toIndex`: the match item index in new item list indicates where to move to.
     * - `insertIndex`: index in old item list indicates where you should insert new item before.
     */
    Move = 2,
    /**
     * Moves same item from it's old index to current index, and do modification.
     * - `fromIndex`: the match item index in old item list indicates where to move from.
     * - `toIndex`: the match item index in new item list indicates where to move to.
     * - `insertIndex`: index in old item list indicates where you should insert new item before.
     */
    MoveModify = 3,
    /**
     * Insert a new item.
     * - `fromIndex`: be `-1`.
     * - `toIndex`: the match item index in new item list indicates which item to insert.
     * - `insertIndex`: index in old item list indicates where you should insert new item before.
     */
    Insert = 4,
    /**
     * Delete old item.
     * - `fromIndex`: the match item index in old item list indicates which item to delete.
     * - `toIndex`: be `-1`.
     * - `insertIndex`: be `-1`.
     */
    Delete = 5
}
/** Get a edit record from an old indices graph to a new one. */
export declare function getEditRecord<T>(oldItems: T[], newItems: T[], willReuse: boolean): EditRecord[];
