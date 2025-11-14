import { CompiledTemplateResult } from "./template-result-compiled.js";
import { NodeTemplateMaker, TextTemplateMaker } from "./template-makers.js";
import { getHydrationWalker, isHydratingPosition } from "../hydrate.js";
/**
 * A `TemplateSlot` locate a slot position `>${...}<` inside a template  literal,
 * it helps to update content of the slot.
 * Must know the content type of slot, otherwise use `DynamicTypedTemplateSlot`.
 */
export class TemplateSlot {
    /**
     * Indicates whether connected to document.
     * Can also avoid calls content connect actions twice in update logic and connect callback.
     */
    connected = false;
    /** End outer position, indicates where to put new content. */
    endOuterPosition;
    contentType = null;
    knownContentType;
    content = null;
    constructor(endOuterPosition, knownType = null) {
        this.endOuterPosition = endOuterPosition;
        this.contentType = knownType;
        this.knownContentType = knownType !== null;
    }
    afterConnectCallback(param) {
        if (this.connected) {
            return;
        }
        this.connected = true;
        // May haven't get updated.
        if (!this.content) {
            return;
        }
        if (this.contentType === 1 /* SlotContentType.TemplateResultList */) {
            for (let t of this.content) {
                t.afterConnectCallback(param);
            }
        }
        else if (this.contentType !== null) {
            this.content.afterConnectCallback(param);
        }
    }
    beforeDisconnectCallback(param) {
        if (!this.connected) {
            return;
        }
        this.connected = false;
        if (this.contentType === 0 /* SlotContentType.TemplateResult */) {
            return this.content.beforeDisconnectCallback(param);
        }
        else if (this.contentType === 1 /* SlotContentType.TemplateResultList */) {
            let promises = [];
            for (let t of this.content) {
                let p = t.beforeDisconnectCallback(param);
                if (p) {
                    promises.push(p);
                }
            }
            if (promises.length > 0) {
                return Promise.all(promises);
            }
        }
    }
    /** Whether has some real content rendered. */
    hasContent() {
        return this.content !== null;
    }
    /**
     * Update by value parameter after known it's type.
     * Note value must be strictly of the content type specified.
     */
    update(value) {
        if (!this.knownContentType) {
            let newContentType = this.identifyContentType(value);
            if (newContentType !== this.contentType) {
                this.clearContent();
            }
            this.contentType = newContentType;
        }
        if (this.contentType === 0 /* SlotContentType.TemplateResult */) {
            this.updateTemplateResult(value);
        }
        else if (this.contentType === 1 /* SlotContentType.TemplateResultList */) {
            this.updateTemplateResultList(value);
        }
        else if (this.contentType === 2 /* SlotContentType.Text */) {
            this.updateText(value);
        }
        else if (this.contentType === 3 /* SlotContentType.Node */) {
            this.updateNode(value);
        }
    }
    /** Identify content type by value. */
    identifyContentType(value) {
        if (value === null || value === undefined) {
            return null;
        }
        else if (value instanceof CompiledTemplateResult) {
            return 0 /* SlotContentType.TemplateResult */;
        }
        else if (Array.isArray(value)) {
            return 1 /* SlotContentType.TemplateResultList */;
        }
        else if (value instanceof Node) {
            return 3 /* SlotContentType.Node */;
        }
        else {
            return 2 /* SlotContentType.Text */;
        }
    }
    /** Clear current content, reset content and content type. */
    clearContent() {
        if (!this.content) {
            return;
        }
        if (this.contentType === 0 /* SlotContentType.TemplateResult */
            || this.contentType === 2 /* SlotContentType.Text */
            || this.contentType === 3 /* SlotContentType.Node */) {
            this.removeTemplate(this.content);
        }
        else {
            let ts = this.content;
            for (let i = 0; i < ts.length; i++) {
                let t = ts[i];
                this.removeTemplate(t);
            }
        }
        this.content = null;
        this.contentType = null;
    }
    /** Update from a template result. */
    updateTemplateResult(tr) {
        let oldT = this.content;
        if (oldT && oldT.canUpdateBy(tr)) {
            oldT.update(tr.values);
        }
        else {
            if (oldT) {
                this.removeTemplate(oldT);
            }
            let walker = getHydrationWalker();
            let newT = isHydratingPosition(this.endOuterPosition) && walker
                ? tr.maker.hydrate(tr.context, walker)
                : tr.maker.make(tr.context);
            newT.insertNodesBefore(this.endOuterPosition);
            newT.update(tr.values);
            if (this.connected) {
                newT.afterConnectCallback(1 /* PartCallbackParameterMask.FromOwnStateChange */ | 2 /* PartCallbackParameterMask.AsDirectNode */);
            }
            this.content = newT;
        }
    }
    /** Update from a template result list. */
    updateTemplateResultList(trs) {
        let content = this.content;
        if (!content) {
            content = this.content = [];
        }
        // Update shared part.
        for (let i = 0; i < trs.length; i++) {
            let oldT = i < content.length ? content[i] : null;
            let tr = trs[i];
            if (oldT && oldT.canUpdateBy(tr)) {
                oldT.update(tr.values);
            }
            else {
                let walker = getHydrationWalker();
                let newT = isHydratingPosition(this.endOuterPosition) && walker
                    ? tr.maker.hydrate(tr.context, walker)
                    : tr.maker.make(tr.context);
                let nextOldT = i < content.length - 1 ? content[i + 1] : null;
                if (oldT) {
                    this.removeTemplate(oldT);
                }
                this.insertTemplate(newT, nextOldT);
                newT.update(tr.values);
                if (this.connected) {
                    newT.afterConnectCallback(1 /* PartCallbackParameterMask.FromOwnStateChange */ | 2 /* PartCallbackParameterMask.AsDirectNode */);
                }
                content[i] = newT;
            }
        }
        // Remove rest part.
        if (trs.length < content.length) {
            for (let i = trs.length; i < content.length; i++) {
                let oldT = content[i];
                this.removeTemplate(oldT);
            }
            content.splice(trs.length, content.length - trs.length);
        }
    }
    /** Insert a template before another one. */
    insertTemplate(t, nextT) {
        let position = nextT?.startInnerPosition ?? this.endOuterPosition;
        t.insertNodesBefore(position);
    }
    /** Remove a template. */
    removeTemplate(t) {
        t.recycleNodes();
    }
    /** Update from a text-like value. */
    updateText(value) {
        let text = value === null || value === undefined ? '' : String(value).trim();
        let t = this.content;
        if (!t) {
            let walker = getHydrationWalker();
            t = this.content = (isHydratingPosition(this.endOuterPosition) && walker)
                ? TextTemplateMaker.hydrate(null, walker)
                : TextTemplateMaker.make(null);
            t.insertNodesBefore(this.endOuterPosition);
        }
        t.update([text]);
    }
    /** Update from a node. */
    updateNode(node) {
        let t = this.content;
        if (node) {
            if (!t) {
                let walker = getHydrationWalker();
                t = this.content = (isHydratingPosition(this.endOuterPosition) && walker)
                    ? NodeTemplateMaker.hydrate(null, walker)
                    : NodeTemplateMaker.make(null);
                t.insertNodesBefore(this.endOuterPosition);
            }
            t.update([node]);
        }
        else {
            if (t) {
                t.update([]);
            }
        }
    }
    /**
     * Update external template manually without comparing template maker.
     * Use this when template is been managed and cached outside.
     * Note it will still connect target template if needed.
     */
    updateExternalTemplate(newT, values) {
        let oldT = this.content;
        if (oldT === newT) {
            if (newT) {
                newT.update(values);
            }
        }
        else {
            if (oldT) {
                this.removeTemplate(oldT);
            }
            if (newT) {
                newT.insertNodesBefore(this.endOuterPosition);
                newT.update(values);
                if (this.connected) {
                    newT.afterConnectCallback(1 /* PartCallbackParameterMask.FromOwnStateChange */ | 2 /* PartCallbackParameterMask.AsDirectNode */);
                }
            }
            this.contentType = 0 /* SlotContentType.TemplateResult */;
            this.content = newT;
        }
    }
    /**
     * Update external template list manually without comparing template maker.
     * Use this when template list is been managed and cached outside.
     * Note it will not connect target template list.
     */
    updateExternalTemplateList(list) {
        this.contentType = 1 /* SlotContentType.TemplateResultList */;
        this.content = list;
    }
}
