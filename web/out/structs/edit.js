import { InternalTwoWayMap } from "./map.js";
/** Get a edit record from an old indices graph to a new one. */
export function getEditRecord(oldItems, newItems, willReuse) {
    if (newItems.length === 0) {
        return oldItems.map(function (_item, index) {
            return {
                type: 5 /* EditType.Delete */,
                fromIndex: index,
                toIndex: -1,
                insertIndex: -1,
            };
        });
    }
    else if (oldItems.length === 0) {
        return newItems.map(function (_item, index) {
            return {
                type: 4 /* EditType.Insert */,
                fromIndex: -1,
                toIndex: index,
                insertIndex: 0,
            };
        });
    }
    else {
        return getNormalEditRecord(oldItems, newItems, willReuse);
    }
}
/**
 * When `oldItems` and `newItems` are both not empty.
 * When `willReuse` is `false`, will never reuse items.
 */
function getNormalEditRecord(oldItems, newItems, willReuse) {
    // `indexMap`: two way index map: sorted old index <=> new index.
    // `restOldIndices`: sorted old indices which not appear in `indexMap`.
    let { indexMap, restOldIndices } = makeTwoWayIndexMap(oldItems, newItems);
    // All the new indices that have an old index mapped to, and order by the orders in the `oldItems`.
    let newIndicesHaveOldMapped = [];
    for (let oldIndex of indexMap.leftKeys()) {
        let indexInNew = indexMap.getByLeft(oldIndex);
        newIndicesHaveOldMapped.push(indexInNew);
    }
    // Get a long enough incremental sequence from new indices,
    // from new indices that have an old index mapped to,
    // so no need move this part.
    let stableNewIndicesStack = new ReadonlyIndexStack(findLongestIncrementalSequence(newIndicesHaveOldMapped));
    // Old item indices that will be reused.
    let restOldIndicesStack = new ReadonlyIndexStack(restOldIndices);
    // New index of the next fully match item pair. `0 ~ newItems.length`
    let nextStableNewIndex = stableNewIndicesStack.getNext();
    // Index of old items to indicate where to insert new item.
    let insertIndex = nextStableNewIndex === -1 ? oldItems.length : indexMap.getByRight(nextStableNewIndex);
    // Output this edit records.
    let edit = [];
    // For each new item.
    for (let toIndex = 0; toIndex < newItems.length; toIndex++) {
        // Old and new items match each other, leave them both.
        if (toIndex === nextStableNewIndex) {
            let fromIndex = indexMap.getByRight(nextStableNewIndex);
            edit.push({
                type: 1 /* EditType.Leave */,
                fromIndex,
                toIndex,
                insertIndex: -1,
            });
            nextStableNewIndex = stableNewIndicesStack.getNext();
            insertIndex = nextStableNewIndex === -1 ? oldItems.length : indexMap.getByRight(nextStableNewIndex);
        }
        // Move matched old item to the new position, no need to modify.
        else if (indexMap.hasRight(toIndex)) {
            let fromIndex = indexMap.getByRight(toIndex);
            edit.push({
                type: 2 /* EditType.Move */,
                fromIndex,
                toIndex,
                insertIndex,
            });
        }
        // Reuse old item, moves them to the new position, then modify.
        else if (willReuse && !restOldIndicesStack.isEnded()) {
            let fromIndex = restOldIndicesStack.getNext();
            edit.push({
                type: 3 /* EditType.MoveModify */,
                fromIndex,
                toIndex,
                insertIndex,
            });
        }
        // No old items can be reused, creates new item.
        else {
            edit.push({
                type: 4 /* EditType.Insert */,
                fromIndex: -1,
                toIndex,
                insertIndex,
            });
        }
    }
    // Remove not used items.
    while (!restOldIndicesStack.isEnded()) {
        let oldIndex = restOldIndicesStack.getNext();
        edit.push({
            type: 5 /* EditType.Delete */,
            fromIndex: oldIndex,
            toIndex: -1,
            insertIndex: -1,
        });
    }
    return edit;
}
/** Create a 2 way index map: old index <=> new index, just like a sql inner join. */
function makeTwoWayIndexMap(oldItems, newItems) {
    // Will find last match when repeated items exist.
    let newItemIndexMap = new Map(newItems.map((item, index) => [item, index]));
    // old index <=> new index.
    let indexMap = new InternalTwoWayMap();
    let restOldIndices = [];
    for (let i = 0; i < oldItems.length; i++) {
        let oldItem = oldItems[i];
        if (newItemIndexMap.has(oldItem)) {
            indexMap.set(i, newItemIndexMap.get(oldItem));
            // Must delete, or will cause error when same item exist.
            newItemIndexMap.delete(oldItem);
        }
        else {
            restOldIndices.push(i);
        }
    }
    return { indexMap, restOldIndices };
}
/**
 * A simple stack can get next one from start position.
 * Can avoid shift or pop operation from an array.
 */
class ReadonlyIndexStack {
    items;
    offset = 0;
    constructor(items) {
        this.items = items;
    }
    addItems(items) {
        this.items.push(...items);
    }
    isEnded() {
        return this.offset >= this.items.length;
    }
    getNext() {
        return this.isEnded()
            ? -1
            : this.items[this.offset++];
    }
    peekNext() {
        return this.isEnded()
            ? -1
            : this.items[this.offset];
    }
}
/** 237456 -> 23456 */
function findLongestIncrementalSequence(items) {
    // In the first loop, we try to find each incremental and continuous sequence.
    // 237456 -> [23, 7, 456]
    let startIndex = 0;
    let increasedSequenceIndices = [];
    for (let i = 1; i < items.length; i++) {
        if (items[i] < items[i - 1]) {
            increasedSequenceIndices.push([startIndex, i]);
            startIndex = i;
        }
    }
    if (startIndex < items.length) {
        increasedSequenceIndices.push([startIndex, items.length]);
    }
    // In the second loop, we try to find the longest discrete incremental sequence.
    // This is not the best, but it can at least pick the longest discrete incremental part,
    // and simple enough.
    // [23, 7, 456]
    // 23 -> 7 skip -> 456 pick
    // [2, 78, 456]
    // 2 -> 78 pick -> 456 pick, not best result
    let longest = [];
    let currentValue = -1;
    for (let i = 0; i < increasedSequenceIndices.length; i++) {
        let [start, end] = increasedSequenceIndices[i];
        if (items[start] > currentValue) {
            longest.push(...items.slice(start, end));
            currentValue = longest[longest.length - 1];
        }
        else if (end - start > longest.length) {
            longest = items.slice(start, end);
            currentValue = longest[longest.length - 1];
        }
    }
    return longest;
}
