/**
 * Make it by compiling:
 * ```html
 * 	<lu:keyed ${...}>...</lu:keyed>
 * ```
 */
export class KeyedBlock {
    slot;
    key = undefined;
    template = null;
    constructor(slot) {
        this.slot = slot;
    }
    update(newKey, result) {
        let template = null;
        if (newKey === this.key
            && result
            && this.template
            && this.template.canUpdateBy(result)) {
            template = this.template;
        }
        else if (result) {
            template = result.maker.make(result.context);
        }
        this.slot.updateExternalTemplate(template, result ? result.values : []);
        this.key = newKey;
        this.template = template;
    }
}
/**
 * Make it by compiling:
 * ```html
 * 	<lu:keyed cache ${...}>...</lu:keyed>
 * ```
 * Note it will cache all rendered templates.
 */
export class CacheableKeyedBlock {
    slot;
    key = undefined;
    template = null;
    templates = new Map();
    constructor(slot) {
        this.slot = slot;
    }
    update(newKey, result) {
        let template = null;
        if (newKey === this.key
            && result
            && this.template
            && this.template.canUpdateBy(result)) {
            template = this.template;
        }
        else if (result) {
            template = this.templates.get(newKey) ?? result.maker.make(result.context);
        }
        this.slot.updateExternalTemplate(template, result ? result.values : []);
        this.key = newKey;
        this.template = template;
        if (template) {
            this.templates.set(newKey, template);
        }
    }
}
/**
 * Make it by compiling:
 * ```
 * 	<lu:keyed weakCache ${...}>...</lu:keyed>
 * ```
 * Note key must be an object.
 */
export class WeakCacheableKeyedBlock {
    slot;
    key = undefined;
    template = null;
    templates = new Map();
    constructor(slot) {
        this.slot = slot;
    }
    update(newKey, result) {
        let template = null;
        if (newKey === this.key
            && result
            && this.template
            && this.template.canUpdateBy(result)) {
            template = this.template;
        }
        else if (newKey && result) {
            template = this.templates.get(newKey) ?? result.maker.make(result.context);
        }
        this.slot.updateExternalTemplate(template, result ? result.values : []);
        this.key = newKey;
        this.template = template;
        if (template) {
            this.templates.set(newKey, template);
        }
    }
}
