import { makeTemplateByComponent } from "../template/index.js";
/**
 * Compiled by:
 * ```html
 * 	<${DynamicComponent}>
 * ```
 */
export class DynamicComponentBlock {
    binder;
    slot;
    contentRange;
    originalEl;
    Com = null;
    com = null;
    constructor(binder, originalEl, slot, contentRange = null) {
        this.binder = binder;
        this.originalEl = originalEl;
        this.slot = slot;
        this.contentRange = contentRange;
    }
    /** Update with new Component Constructor. */
    update(NewCom) {
        if (NewCom === this.Com) {
            return;
        }
        let com = new NewCom(this.originalEl);
        this.binder(com);
        if (this.com) {
            this.com.$transferSlotContents(com);
        }
        // First time updating.
        else {
            this.originalEl = undefined;
            if (this.contentRange) {
                com.$applyRestSlotRange(this.contentRange);
            }
        }
        let template = makeTemplateByComponent(com);
        this.slot.updateExternalTemplate(template, []);
        this.Com = NewCom;
        this.com = com;
    }
}
