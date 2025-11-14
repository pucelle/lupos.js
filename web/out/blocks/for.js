import { getEditRecord } from "../structs/edit.js";
/**
 * Make it by compiling:
 * ```html
 * 	<lu:for ${...}>${(item) => html`
 * 		...
 * 	`}</lu:for>
 * ```
 */
export class ForBlock {
    slot;
    context;
    renderFn;
    data = [];
    templates = [];
    constructor(slot) {
        this.slot = slot;
    }
    /** Update render function. */
    updateRenderFn(renderFn) {
        this.renderFn = renderFn;
    }
    /** Update data items. */
    updateData(data) {
        // Must clone, will compare it with the data at next time updating.
        let newData = [...data];
        let oldData = this.data;
        let oldTs = this.templates;
        let editRecord = getEditRecord(oldData, newData, true);
        this.data = newData;
        this.templates = [];
        for (let record of editRecord) {
            let { type, insertIndex, fromIndex, toIndex } = record;
            let nextOldT = this.getItemAtIndex(oldTs, insertIndex);
            let fromT = this.getItemAtIndex(oldTs, fromIndex);
            let newItem = toIndex >= 0 ? newData[toIndex] : null;
            let result = newItem ? this.renderFn(newItem, toIndex) : null;
            if (type === 1 /* EditType.Leave */) {
                this.leaveTemplate(fromT, result);
            }
            else if (type === 2 /* EditType.Move */ || type === 3 /* EditType.MoveModify */) {
                if (fromT.canUpdateBy(result)) {
                    this.moveTemplate(fromT, nextOldT);
                    this.reuseTemplate(fromT, result);
                }
                else {
                    this.removeTemplate(fromT);
                    this.createTemplate(result, nextOldT);
                }
            }
            else if (type === 4 /* EditType.Insert */) {
                this.createTemplate(result, nextOldT);
            }
            else if (type === 5 /* EditType.Delete */) {
                this.removeTemplate(fromT);
            }
        }
        this.slot.updateExternalTemplateList(this.templates);
    }
    getItemAtIndex(items, index) {
        if (index < items.length && index >= 0) {
            return items[index];
        }
        else {
            return null;
        }
    }
    createTemplate(result, nextOldT) {
        let t = result.maker.make(result.context);
        this.insertTemplate(t, nextOldT);
        t.update(result.values);
        // `lu:for` use it's slot to cache child parts.
        if (this.slot.connected) {
            t.afterConnectCallback(1 /* PartCallbackParameterMask.FromOwnStateChange */ | 2 /* PartCallbackParameterMask.AsDirectNode */);
        }
        this.templates.push(t);
    }
    leaveTemplate(t, result) {
        t.update(result.values);
        this.templates.push(t);
    }
    reuseTemplate(t, result) {
        // Can't directly reuse, or transition will play unexpectedly.
        t.beforeDisconnectCallback(1 /* PartCallbackParameterMask.FromOwnStateChange */ | 2 /* PartCallbackParameterMask.AsDirectNode */ | 8 /* PartCallbackParameterMask.MoveImmediately */);
        t.update(result.values);
        if (this.slot.connected) {
            t.afterConnectCallback(1 /* PartCallbackParameterMask.FromOwnStateChange */ | 2 /* PartCallbackParameterMask.AsDirectNode */ | 8 /* PartCallbackParameterMask.MoveImmediately */);
        }
        this.templates.push(t);
    }
    removeTemplate(t) {
        t.recycleNodes();
    }
    moveTemplate(t, nextOldT) {
        let position = nextOldT?.startInnerPosition ?? this.slot.endOuterPosition;
        t.moveNodesBefore(position);
    }
    insertTemplate(t, nextOldT) {
        let position = nextOldT?.startInnerPosition ?? this.slot.endOuterPosition;
        t.insertNodesBefore(position);
    }
}
